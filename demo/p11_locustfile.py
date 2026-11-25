"""What a locust user does: read cases, now and then ask for a report.

    cd demo
    uv run --python 3.13 --with locust locust -f p11_locustfile.py \
        --host http://127.0.0.1:4365 --headless -u 40 -r 2 -t 40s
    # drop --headless to get the web UI on http://localhost:8089
"""

from locust import HttpUser, between, task


class Detective(HttpUser):
    wait_time = between(0.05, 0.15)  # think time between two requests of one user

    @task
    def report(self) -> None:
        self.client.get("/cases/C-1/report", name="/cases/{id}/report")
