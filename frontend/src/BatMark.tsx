import logo from "./assets/bat-logo.png";

type BatMarkProps = {
  className?: string;
};

export function BatMark({ className }: BatMarkProps) {
  return <img src={logo} alt="BatDesk" className={className} draggable={false} />;
}
