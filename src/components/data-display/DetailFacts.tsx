export function DetailFacts({
  items,
}: {
  items: { label: string; value: string }[];
}) {
  return (
    <dl className="detail-facts">
      {items.map((item) => (
        <div key={item.label}>
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
