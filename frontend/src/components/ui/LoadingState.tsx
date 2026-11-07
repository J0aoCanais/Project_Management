interface Props {
  message?: string;
}

function LoadingState({ message = "A carregar…" }: Props) {
  return (
    <div role="status" className="px-5 py-12 text-center text-muted">
      {message}
    </div>
  );
}

export default LoadingState;
