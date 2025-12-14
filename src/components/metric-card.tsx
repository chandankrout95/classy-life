"use client";

import { useState, useRef, useEffect } from "react";
import { Check, X } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatNumber } from "@/lib/utils";

interface MetricCardProps {
  icon: React.ElementType;
  label: string;
  value: number;
  isEditable?: boolean;
  onSave: (value: number) => void;
}

export function MetricCard({
  icon: Icon,
  label,
  value,
  isEditable = false,
  onSave,
}: MetricCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedValue, setEditedValue] = useState(value.toString());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);
  
  useEffect(() => {
    if (!isEditing) {
      setEditedValue(value.toString());
    }
  }, [value, isEditing]);

  const handleSave = () => {
    const numericValue = parseInt(editedValue, 10);
    if (!isNaN(numericValue)) {
      onSave(numericValue);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedValue(value.toString());
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="flex items-center gap-2">
            <Input
              ref={inputRef}
              type="number"
              value={editedValue}
              onChange={(e) => setEditedValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="h-9 text-xl"
            />
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={handleSave}>
              <Check className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={handleCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div
            className="text-2xl font-bold"
            onClick={() => isEditable && setIsEditing(true)}
            role={isEditable ? "button" : "figure"}
            tabIndex={isEditable ? 0 : -1}
            onKeyDown={(e) => {
              if (isEditable && e.key === 'Enter') {
                setIsEditing(true);
              }
            }}
          >
            {label.includes("Time") ? `${value}` : formatNumber(value)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
