# Set invoke permissions
gcloud functions add-invoker-policy-binding secretsv1 \
  --region="northamerica-northeast1" \
  --member="serviceAccount:sb-maintenance-account@poc-development-419102.iam.gserviceaccount.com" \
  --project="poc-development-419102"

# Deploy scheduler
gcloud scheduler jobs create http refresh-secrets \
  --location="northamerica-northeast1" \
  --time-zone="America/Toronto" \
  --schedule="0 1 * * *" \
  --uri="https://northamerica-northeast1-poc-development-419102.cloudfunctions.net/secretsv1/secrets/renew" \
  --http-method=POST \
  --oidc-service-account-email="sb-maintenance-account@poc-development-419102.iam.gserviceaccount.com" \
  --oidc-token-audience="https://northamerica-northeast1-poc-development-419102.cloudfunctions.net/secretsv1" \
  --project="poc-development-419102"
