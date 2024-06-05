import "./GraphicTooltip.scss";

export const CustomTooltip = ({
  active,
  payload,
  label,
  area,
}: {
  active?: boolean;
  payload?: { value: string }[];
  label?: string;
  area: boolean;
}) => {
  if (active && payload && payload.length) {
    const ganhos = payload[0]?.value.toLocaleString();
    const despesas = payload[1]?.value.toLocaleString();

    return (
      <div className="barras-tooltip">
        <p className="label">{label}</p>
        {area === true ? (
          <p className="ganhos">Saldo Total: R$ {ganhos}</p>
        ) : (
          <>
            <p className="ganhos">Ganhos: R$ {ganhos}</p>
            <p className="despesas">Despesas: R$ {despesas}</p>
          </>
        )}
      </div>
    );
  }
  return null;
};
