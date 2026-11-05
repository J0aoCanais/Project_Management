import Button from "./Button";

interface Props {
  message?: string;
  onRetry: () => void;
}

function ErrorState({ message = "Não foi possível carregar os dados.", onRetry }: Props) {
  return (
    <div role="alert" className="grid justify-items-center gap-3 px-5 py-12 text-center">
      <p className="text-danger">{message}</p>
      <Button onClick={onRetry}>Tentar novamente</Button>
    </div>
  );
}

export default ErrorState;
