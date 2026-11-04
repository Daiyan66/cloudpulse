output "instance_id" {
  description = "EC2 Instance ID"
  value       = aws_instance.cloudpulse_server.id
}

output "public_ip" {
  description = "Public IPv4 address of the CloudPulse server"
  value       = aws_instance.cloudpulse_server.public_ip
}

output "app_url" {
  description = "Web access URL for CloudPulse app"
  value       = "http://${aws_instance.cloudpulse_server.public_ip}"
}

output "status_page_url" {
  description = "Public status page URL"
  value       = "http://${aws_instance.cloudpulse_server.public_ip}/status"
}

output "grafana_url" {
  description = "Grafana dashboard URL"
  value       = "http://${aws_instance.cloudpulse_server.public_ip}:3001"
}

output "ssh_command" {
  description = "SSH connection string"
  value       = "ssh -i your-key.pem ubuntu@${aws_instance.cloudpulse_server.public_ip}"
}
