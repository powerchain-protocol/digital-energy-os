terraform { required_version = ">= 1.8.0" }
variable "environment" { type=string default="staging" }
variable "region" { type=string default="us-east-1" }
output "deployment_summary" { value={ application="powerchain-platform", environment=var.environment, region=var.region } }
