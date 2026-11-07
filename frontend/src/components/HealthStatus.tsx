import type { HealthResponse } from "../api/healthApi";

interface Props {
  health: HealthResponse;
}

function HealthStatus({ health }: Props) {
  const isHealthy =
    health.status === "ok" &&
    health.database === "connected";

  return (
    <div className={`status-card ${isHealthy ? "healthy" : "unhealthy"}`}>
      <h2>
        {isHealthy ? "System healthy" : "System unhealthy"}
      </h2>

      <p>
        Flask API: {health.status === "ok" ? "Running" : "Error"}
      </p>

      <p>
        PostgreSQL: {health.database}
      </p>
    </div>
  );
}

export default HealthStatus;    