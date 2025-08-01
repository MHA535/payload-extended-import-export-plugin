export interface CollectionField {
	example?: string;
	hasDefaultValue?: boolean; // Новое поле для индикации наличия значения по умолчанию
	label: string;
	name: string;
	required?: boolean;
	type: string;
}

export interface FieldMapping {
	collectionField: string;
	csvField: string;
}

export interface ImportSettings {
	compareField?: string; // Поле для сравнения при обновлении
	fieldMappings: FieldMapping[];
	locale?: string; // Локаль для импорта
	mode: "create" | "update" | "upsert";
}

export type ImportMode = "create" | "update" | "upsert";

export interface ImportConfig {
	collectionFields: CollectionField[];
	settings: ImportSettings;
}
