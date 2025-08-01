import React from "react";

interface LocaleSelectorProps {
	value: string;
	onChange: (locale: string) => void;
}

const LocaleSelector: React.FC<LocaleSelectorProps> = ({ value, onChange }) => {
	const locales = [
		{ code: "en", label: "English" },
		{ code: "ru", label: "Русский" },
		{ code: "uk", label: "Українська" },
		{ code: "bg", label: "Български" },
	];

	return (
		<div style={{ marginBottom: "16px" }}>
			<label
				style={{
					display: "block",
					marginBottom: "8px",
					fontWeight: "500",
					fontSize: "14px",
				}}
			>
				Локаль для импорта:
			</label>
			<select
				value={value}
				onChange={(e) => onChange(e.target.value)}
				style={{
					width: "200px",
					padding: "8px 12px",
					border: "1px solid #ddd",
					borderRadius: "4px",
					fontSize: "14px",
					backgroundColor: "#fff",
				}}
			>
				{locales.map((locale) => (
					<option key={locale.code} value={locale.code}>
						{locale.label}
					</option>
				))}
			</select>
		</div>
	);
};

export default LocaleSelector;
