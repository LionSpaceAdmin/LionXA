output "instance_ip_address" {
  description = "The external IP address of the LionXA VM instance (if enabled)."
  value       = try(google_compute_instance.lionxa_vm[0].network_interface[0].access_config[0].nat_ip, null)
}
