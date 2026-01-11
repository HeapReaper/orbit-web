interface Props {
  text: string;
}

export default function InfoLabel({ text }: Props) {
  return (
    <div className="mb-4 p-3 rounded-md bg-blue-600/20 text-blue-300 border border-blue-500 text-sm">
      {text}
    </div>
  );
}
