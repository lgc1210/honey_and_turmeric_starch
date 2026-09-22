"use client";

import { Button } from "./button";
import { Input } from "./input";

export function QuantityInput({
	value,
	onChange,
	min = 1,
	max = 999,
	disabled,
}: {
	value: number;
	onChange: (next: number) => void;
	min?: number;
	max?: number;
	disabled?: boolean;
}) {
	function clamp(next: number): number {
		return Math.min(max, Math.max(min, next));
	}

	return (
		<div className='inline-flex items-center border border-input'>
			<Button
				type='button'
				variant='ghost'
				size='icon-sm'
				disabled={disabled || value <= min}
				onClick={() => onChange(clamp(value - 1))}
				aria-label='Giảm số lượng'>
				−
			</Button>
			<Input
				type='number'
				min={min}
				max={max}
				value={value}
				disabled={disabled}
				onChange={(e) => onChange(clamp(Number(e.target.value) || min))}
				className='w-14 border-0 text-center [appearance:textfield] focus-visible:ring-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
			/>
			<Button
				type='button'
				variant='ghost'
				size='icon-sm'
				disabled={disabled || value >= max}
				onClick={() => onChange(clamp(value + 1))}
				aria-label='Tăng số lượng'>
				+
			</Button>
		</div>
	);
}
