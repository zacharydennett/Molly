"use client";

import { ChevronLeft, ChevronRight, ChevronDown, RotateCw, ArrowDown } from "lucide-react";

interface Props {
  onLeft: () => void;
  onRight: () => void;
  onRotate: () => void;
  onSoftDrop: () => void;
  onHardDrop: () => void;
}

function ControlBtn({
  onClick,
  children,
  label,
  wide = false,
}: {
  onClick: () => void;
  children: React.ReactNode;
  label: string;
  wide?: boolean;
}) {
  return (
    <button
      onPointerDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      aria-label={label}
      className={`
        flex flex-col items-center justify-center gap-0.5
        bg-molly-navy text-white rounded-xl font-bold
        active:bg-molly-navy-light active:scale-95 transition-transform select-none
        ${wide ? "py-3 px-6" : "p-3"}
      `}
    >
      {children}
    </button>
  );
}

export function TetrisControls({ onLeft, onRight, onRotate, onSoftDrop, onHardDrop }: Props) {
  return (
    <div className="md:hidden">
      <div className="flex justify-center gap-2 mt-3">
        <ControlBtn onClick={onLeft} label="Move Left">
          <ChevronLeft className="w-6 h-6" />
          <span className="text-xs">Left</span>
        </ControlBtn>
        <ControlBtn onClick={onSoftDrop} label="Soft Drop">
          <ChevronDown className="w-6 h-6" />
          <span className="text-xs">Down</span>
        </ControlBtn>
        <ControlBtn onClick={onRotate} label="Rotate">
          <RotateCw className="w-6 h-6" />
          <span className="text-xs">Rotate</span>
        </ControlBtn>
        <ControlBtn onClick={onRight} label="Move Right">
          <ChevronRight className="w-6 h-6" />
          <span className="text-xs">Right</span>
        </ControlBtn>
        <ControlBtn onClick={onHardDrop} label="Hard Drop" wide>
          <ArrowDown className="w-6 h-6" />
          <span className="text-xs">Drop</span>
        </ControlBtn>
      </div>
    </div>
  );
}
