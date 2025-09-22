variable "google_api_key" {
  type        = string
  description = "Google API Key for Gemini"
  sensitive   = true
}

variable "vnc_password" {
  type        = string
  description = "Password for VNC access via Guacamole"
  sensitive   = true
}

variable "project_id" {
  type        = string
  description = "The GCP project ID to deploy the VM to."
}


variable "enable_vm" {
  description = "Whether to create the demo Compute Engine VM and related resources"
  type        = bool
  default     = false
}
