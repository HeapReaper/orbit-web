interface Props {
  text: string;
}

export default function DangerLabel({ text }: Props) {
  return (
    <div className="mb-4 p-3 rounded-md bg-yellow-600/20 text-yellow-300 border border-yellow-500 text-sm">
      {text}
    </div>
  );
}
