# =========================
# XAgent Super Admin (MAX)
# Project: lionspace | Region: us-central1
# =========================
set -euo pipefail

PROJECT="lionspace"
REGION="us-central1"
SA_NAME="xagent-superadmin"
SA_DISPLAY="XAgent Super Admin (MAX)"
SA_EMAIL="${SA_NAME}@${PROJECT}.iam.gserviceaccount.com"
KEY_PATH="${HOME}/Downloads/${SA_NAME}-key.json"

echo ">>> Set gcloud project"
gcloud config set project "${PROJECT}" >/dev/null

echo ">>> Enable core APIs (idempotent)"
gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com \
  aiplatform.googleapis.com \
  secretmanager.googleapis.com \
  logging.googleapis.com \
  monitoring.googleapis.com \
  compute.googleapis.com \
  apphub.googleapis.com \
  servicemanagement.googleapis.com \
  serviceusage.googleapis.com \
  iam.googleapis.com \
  --project "${PROJECT}"

echo ">>> Create Service Account if missing"
if ! gcloud iam service-accounts describe "${SA_EMAIL}" --project "${PROJECT}" >/dev/null 2>&1; then
  gcloud iam service-accounts create "${SA_NAME}" \
    --display-name "${SA_DISPLAY}" \
    --project "${PROJECT}"
fi

echo ">>> Grant MAX roles"
# גרנט "מקסימלי": Owner + אקסטרות שימושיות לדיפלוי/תפעול.
ROLES=(
  "roles/owner"                           # הכל בפרויקט (כולל ניהול IAM בפרויקט)
  "roles/iam.serviceAccountTokenCreator"  # חתימת OIDC/JWT לצרכי CI/CD
  "roles/iam.serviceAccountUser"          # להריץ כ-SAs אחרים
  "roles/serviceusage.serviceUsageAdmin"  # הפעלת/ביטול APIs
  "roles/resourcemanager.projectIamAdmin" # ניהול IAM על הפרויקט (חופף לבעלים אך נשאיר)
  "roles/artifactregistry.admin"          # רישום/ניהול מאגרים ודחיפת אימגים
  "roles/cloudbuild.builds.editor"        # הרצת Cloud Build
  "roles/compute.admin"                   # אם Terraform יוצר LB/רשת
  "roles/run.admin"                       # Cloud Run מלא
  "roles/secretmanager.admin"             # ניהול Secrets
  "roles/logging.admin"                   # ניהול לוגים
  "roles/monitoring.admin"                # ניהול מטריקות/דאשבורדים
  "roles/aiplatform.admin"                # Vertex AI מלא
  "roles/apphub.admin"                    # App Design Center / App Hub
  "roles/storage.admin"                   # GCS מלא (לטריגרי Storage/Firebase)
)

for ROLE in "${ROLES[@]}"; do
  gcloud projects add-iam-policy-binding "${PROJECT}" \
    --member "serviceAccount:${SA_EMAIL}" \
    --role "${ROLE}" --quiet --condition=None >/dev/null
done
echo ">>> Roles granted to ${SA_EMAIL}"

echo ">>> Create & download key (JSON)"
if [ ! -f "${KEY_PATH}" ]; then
  gcloud iam service-accounts keys create "${KEY_PATH}" \
    --iam-account "${SA_EMAIL}" \
    --project "${PROJECT}"
else
  echo "Key already exists at: ${KEY_PATH}"
fi

echo ">>> Activate key for gcloud"
gcloud auth activate-service-account --key-file "${KEY_PATH}"
gcloud config set project "${PROJECT}"

echo ">>> Configure Docker for Artifact Registry"
gcloud auth configure-docker "${REGION}-docker.pkg.dev" --quiet

echo ">>> Activate Application Default Credentials (ADC)"
gcloud auth application-default login --key-file="${KEY_PATH}"
gcloud auth application-default set-quota-project "${PROJECT}"

echo ">>> Sanity checks"
gcloud services list --enabled --project "${PROJECT}" | head -n 20 || true
gcloud artifacts repositories list --location="${REGION}" --project "${PROJECT}" | head -n 10 || true
gcloud run regions list --project "${PROJECT}" | head -n 10 || true

cat <<'NOTE'

✅ DONE — Super-admin SA ready.

Service Account:    '"${SA_EMAIL}"'
Key file:           '"${KEY_PATH}"'
Project/Region:     '"${PROJECT}/${REGION}"'

Next typical steps:
  • docker build -t ${REGION}-docker.pkg.dev/${PROJECT}/xagent/xagent:prod .
  • docker push  -t ${REGION}-docker.pkg.dev/${PROJECT}/xagent/xagent:prod
  • cd infra/terraform && terraform apply -var-file=prod.auto.tfvars

⚠️ SECURITY:
  • שמור את קובץ ה-JSON באופן מאובטח, אל תעלה ל-Git.
  • כשתסיים – מחק את המפתח:
      gcloud iam service-accounts keys list --iam-account "${SA_EMAIL}"
      gcloud iam service-accounts keys delete KEY_ID --iam-account "${SA_EMAIL}"
  • לפרודקשן מומלץ לחזור ל-Least-Privilege או לעבוד בלי מפתחות (Workload Identity Federation).

NOTE
