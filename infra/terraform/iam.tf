
resource "google_project_iam_member" "secret_accessor" {
  project = "google-mpf-172983073065"
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:xagent-service-us-central1-sa@google-mpf-172983073065.iam.gserviceaccount.com"
}
