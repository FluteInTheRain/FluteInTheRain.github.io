import os
from pathlib import Path
from diagrams import Diagram, Cluster, Edge
from diagrams.aws.compute import EC2
from diagrams.aws.database import RDS
from diagrams.aws.network import Route53, ALB, NATGateway
from diagrams.aws.storage import S3, ElasticBlockStoreEBS
from diagrams.onprem.compute import Server
from diagrams.onprem.database import PostgreSQL
from diagrams.onprem.container import Docker
from diagrams.onprem.network import Traefik
from diagrams.generic.network import Switch
from diagrams.onprem.client import Users

OUT_DIR = Path("src/assets/blog/trade-offs-in-data-systems-architecture")
OUT_DIR.mkdir(parents=True, exist_ok=True)

out_file = OUT_DIR / "cloud-vs-colocation-architecture"

graph_attr = {
    "fontsize": "18",
    "bgcolor": "white",
    "pad": "0.5",
    "compound": "true",
    "rankdir": "LR",
}

with Diagram("Cloud (AWS) vs. 37signals Bare-Metal Colocation", show=False, filename=str(out_file), graph_attr=graph_attr):
    users = Users("Global Traffic")

    # AWS Cloud Side
    with Cluster("Public Cloud: AWS Managed Infrastructure ($$$ Variable OpEx)"):
        dns = Route53("Route 53 DNS")
        alb = ALB("Application Load Balancer")
        
        with Cluster("Compute & Storage"):
            ec2 = EC2("EC2 Fleet (c6i)\n[Virtualized vCPUs]")
            rds = RDS("RDS Aurora Postgres\n[Primary-Replica]")
            ebs = ElasticBlockStoreEBS("EBS io2 Block Express\n[$4,000/mo Metered IOPS!]")
            s3 = S3("Amazon S3 Buckets\n[Object Storage]")
            nat = NATGateway("NAT Gateway\n[$0.09/GB Egress Tax!]")
            
            ec2 >> Edge(label="SQL Queries") >> rds >> ebs
            ec2 >> s3
            ec2 >> nat

        dns >> alb >> ec2

    # 37signals Colocation Side
    with Cluster("Self-Hosted: 37signals Bare-Metal Colocation ($840k/yr Fixed TCO)"):
        with Cluster("Dual Redundant Colocation (Deft Chicago & Ashburn)"):
            fiber = Switch("Unmetered 10G Transit Commit\n[Pennies per GB!]")
            
            with Cluster("18x Dell PowerEdge R7625 Servers"):
                traefik = Traefik("Traefik Ingress\n(Kamal Zero-Downtime)")
                docker = Docker("Application Containers\n(96 AMD EPYC Cores / 576GB RAM)")
                bare_pg = PostgreSQL("PostgreSQL on NVMe SSD\n[800,000+ IOPS forever ($0/mo)]")
                
                fiber >> traefik >> docker >> Edge(label="Local NVMe I/O") >> bare_pg

    users >> Edge(color="orange", style="bold") >> dns
    users >> Edge(color="green", style="bold") >> fiber

print(f"Generated: {out_file}.png")
