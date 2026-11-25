import logo from "./assets/bat-logo.png";

type BatMarkProps = {
  className?: string;
  size?: number;
};

export function BatMark({ className = "", size = 32 }: BatMarkProps) {
  return (
    <div className={`batmark-container ${className}`.trim()} style={{ width: size, height: size }}>
      <img
        src={logo}
        alt="BatDesk"
        className="batmark-img"
        width={size}
        height={size}
        draggable={false}
      />
    </div>
  );
}
