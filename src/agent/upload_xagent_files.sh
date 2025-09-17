#!/bin/zsh

API_KEY="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"
ORG_ID="org-ID9QJhBkoubnJeQ1QhLHSe8A"
UPLOAD_DIR="xagent_upload"

# בדיקת כפילויות שמות קבצים
print "בודק כפילויות שמות קבצים..."
ls $UPLOAD_DIR/profile_*.json | xargs -n1 basename | sort | uniq -d | while read dup; do
  if [[ -n "$dup" ]]; then
    echo "כפילות בשם: $dup. עצירה."
    exit 1
  fi
done

for file in $UPLOAD_DIR/profile_*.json; do
  echo "Uploading $file..."
  curl https://api.openai.com/v1/files \
    -H "Authorization: Bearer $API_KEY" \
    -H "OpenAI-Organization: $ORG_ID" \
    -F "purpose=assistants" \
    -F "file=@$file"
done
