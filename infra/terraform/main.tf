# --- Network Configuration ---
resource "google_compute_network" "vpc_network" {
  name                    = "lionxa-vpc"
  auto_create_subnetworks = true
}

resource "google_compute_firewall" "allow_http_https_ssh" {
  count   = var.enable_vm ? 1 : 0
  name    = "lionxa-firewall"
  network = google_compute_network.vpc_network.name
  allow {
    protocol = "tcp"
    ports    = ["22", "80", "443", "3000", "8080"]
  }
  source_ranges = ["0.0.0.0/0"] # For production, restrict this to specific IPs
}

resource "google_compute_address" "static_ip" {
  count  = var.enable_vm ? 1 : 0
  name   = "lionxa-static-ip"
  region = var.cloud_run_location
}

# --- Compute Engine VM ---
resource "google_compute_instance" "lionxa_vm" {
  count        = var.enable_vm ? 1 : 0
  name         = "lionxa-server"
  machine_type = "e2-standard-4" # Adjust based on performance needs
  zone         = "us-central1-a"   # Choose a zone close to you

  boot_disk {
    initialize_params {
      image = "ubuntu-os-cloud/ubuntu-2204-lts"
      size  = 50 # GB
    }
  }

  network_interface {
    network = google_compute_network.vpc_network.id
    access_config {}
  }

  # This script runs automatically when the VM is created
  metadata_startup_script = <<-EOF
    #!/bin/bash
    # Log everything
    exec > >(tee /var/log/startup-script.log|logger -t startup-script -s 2>/dev/console) 2>&1

    echo "--- Starting VM Setup ---"

    # Install Docker
    apt-get update
    apt-get install -y docker.io docker-compose-v2
    systemctl start docker
    systemctl enable docker

    # Install Git and other tools
    apt-get install -y git

    # Clone the repository
    git clone https://github.com/LionSpaceAdmin/LionXA.git /opt/lionxa # החלף בכתובת ה-Repo שלך

    cd /opt/lionxa

    # Create .env file with secrets from Terraform variables
    # Note: values provided via TF vars; for production prefer Secret Manager
    echo "GOOGLE_API_KEY=${var.google_api_key}" >> .env
    echo "VNC_PASSWORD=${var.vnc_password}" >> .env

    echo "--- Building and launching Docker containers ---"
    docker compose up --build -d

    echo "--- VM Setup Finished ---"
  EOF

  service_account {
    scopes = ["cloud-platform"]
  }

  # Pass secrets to the startup script
  metadata = {
    google_api_key_secret = var.google_api_key
    vnc_password_secret   = var.vnc_password
  }

  tags = ["http-server", "https-server"]
}
