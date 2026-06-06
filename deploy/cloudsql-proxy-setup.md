# Connecting to Cloud SQL — Private IP vs Auth Proxy

The app on the VM connects to Cloud SQL Postgres on every request. There are two ways to do that. Pick one.

## Recommended for VarmaSite: private IP

The VM and the Cloud SQL instance both live in the **default VPC** in `asia-south1`. When you check the **"Private IP"** box during Cloud SQL creation (Step 1 of [GCP_DEPLOYMENT_GUIDE.md](GCP_DEPLOYMENT_GUIDE.md)) and have **Service Networking API enabled** (Step 0), the SQL instance gets a private IP inside that VPC and the VM can reach it directly:

```env
# .env on the VM
DATABASE_URL=postgresql://varmasite:PASSWORD@10.x.x.x:5432/varmasite
```

That's the whole setup. No proxy process to run, no extra IAM, no port forwarding. The traffic stays inside Google's network — never touches the public internet.

**Why this is the right pick here:**
- The app runs in one place (the VM). It doesn't need to connect from anywhere else.
- Adds no operational surface (no proxy process to monitor, no separate auth flow).
- No public IP on the SQL instance = no exposure to drive-by Postgres scans.

**One gotcha:** Service Networking API must be enabled **before** you create the SQL instance. If you forget, the private IP option in the SQL console will be greyed out. Enable it, then retry. (If you already created the instance with public IP only, you can add private IP after the fact via the console — but it requires a brief restart.)

## When you'd want the Auth Proxy instead

The [Cloud SQL Auth Proxy](https://cloud.google.com/sql/docs/postgres/sql-proxy) is the right answer when the client connecting to Cloud SQL is **outside the VPC**:

| Scenario | Why proxy |
|---|---|
| Your laptop needs to run `psql` against prod | The VPC's private IP isn't reachable from the public internet. |
| Cloud Run / Cloud Functions need to query Cloud SQL | Serverless workloads don't sit in your VPC by default. |
| GitHub Actions / CI runs migrations | Same — CI runners are outside your VPC. |
| You want IAM database authentication (no password) | Auth Proxy supports this; raw connections don't. |

If a future need lands (one-off migration run from your laptop, a Cloud Run worker, a CI-based deploy hook), the proxy is what you'd reach for. Install once via `gcloud components install cloud-sql-proxy`, then:

```bash
# From your laptop, opens 127.0.0.1:5432 forwarded to the Cloud SQL instance
cloud-sql-proxy --port 5432 YOUR_PROJECT_ID:asia-south1:varmasite-db

# Then in another terminal:
psql "postgresql://varmasite:PASSWORD@127.0.0.1:5432/varmasite"
```

The proxy authenticates with your `gcloud` session, so no DB password traverses the public internet — but the Postgres password (or IAM token) still authenticates the connection itself.

## Don't enable Public IP on the SQL instance

Even with the Auth Proxy, the recommendation is to leave **Public IP off** for the Cloud SQL instance. The Auth Proxy works against private-IP instances too (it tunnels via Google's control plane). Public IP only exists for cases like "I need to connect a legacy on-prem tool that doesn't know about the proxy," which isn't this project.

## Troubleshooting

- **"Connection refused" from the VM**: check that the VM and SQL instance are in the same VPC (default VPC in both cases for a fresh project). `gcloud sql instances describe varmasite-db --format="value(ipAddresses[0].ipAddress)"` should print a 10.x.x.x address.
- **"Hostname is unreachable"**: Service Networking API might not have been enabled when the SQL instance was created. Enable it and either recreate the instance or edit the instance to add private IP.
- **Slow first query**: cold-start of the Cloud SQL connection. Prisma reuses connections; subsequent queries are fast.
- **Migrations failing with TLS errors**: append `?sslmode=disable` to the DATABASE_URL for the migration command (private IP traffic is already inside Google's network — TLS adds nothing here and Cloud SQL's default cert may not be on the VM's trust store). Re-enable for runtime if your security review requires it; the trade-off is operational complexity vs zero added confidentiality.
