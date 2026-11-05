import { useQuery } from "@tanstack/react-query";

import { getHealth } from "../api/healthApi";
import HealthStatus from "../components/HealthStatus";

function HealthPage() {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["health"],
    queryFn: getHealth,
    refetchInterval: 10000,
  });

  if (isLoading) {
    return <main className="health-page"><p>Checking system health...</p></main>;
  }

  if (isError) {
    return (
      <div className="health-page">
        <h2>Health check failed</h2>
        <p>{error.message}</p>

        <button onClick={() => refetch()}>
          Try again
        </button>
      </div>
    );
  }

  return (
    <main className="health-page">
      <h1>System Health Check</h1>

      <p>
        This page checks whether Flask can communicate
        with PostgreSQL.
      </p>

      {data && <HealthStatus health={data} />}

      <button onClick={() => refetch()} disabled={isFetching}>
        {isFetching ? "Checking..." : "Check again"}
      </button>

      <p className="refresh-info">
        Automatically refreshed every 10 seconds.
      </p>
    </main>
  );
}

export default HealthPage;