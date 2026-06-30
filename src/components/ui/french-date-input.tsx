"use client";

import * as React from "react";
import {
  formatFrenchDateInput,
  isoToFrenchDate,
  parseFrenchDateToIso,
} from "@/lib/utils/date";
import { Input } from "@/components/ui/input";

interface FrenchDateInputProps extends Omit<
  React.ComponentProps<typeof Input>,
  "type" | "value" | "onChange"
> {
  /** Valeur ISO YYYY-MM-DD ou chaîne vide. */
  value: string;
  onChange: (iso: string) => void;
}

export function FrenchDateInput({ value, onChange, ...props }: FrenchDateInputProps) {
  const [text, setText] = React.useState(() => (value ? isoToFrenchDate(value) : ""));

  React.useEffect(() => {
    setText(value ? isoToFrenchDate(value) : "");
  }, [value]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const formatted = formatFrenchDateInput(e.target.value);
    setText(formatted);
    if (!formatted) {
      onChange("");
      return;
    }
    const iso = parseFrenchDateToIso(formatted);
    if (iso) onChange(iso);
  }

  return (
    <Input
      {...props}
      type="text"
      inputMode="numeric"
      placeholder="jj/mm/aaaa"
      value={text}
      onChange={handleChange}
      maxLength={10}
      autoComplete="off"
    />
  );
}
