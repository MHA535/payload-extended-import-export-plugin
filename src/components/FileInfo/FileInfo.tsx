import { X } from "lucide-react";
import React from "react";

interface FileInfoProps {
	file: File;
	onClear: () => void;
}

const FileInfo: React.FC<FileInfoProps> = ({ file, onClear }) => {
	return (
		<div
			style={{
				padding: "16px",
				backgroundColor: "#f5f5f5",
				borderRadius: "8px",
				marginBottom: "20px",
				display: "flex",
				justifyContent: "space-between",
				alignItems: "center",
			}}
		>
			<div>
				<strong>Выбранный файл:</strong> {file.name}
				<br />
				<small>Размер: {(file.size / 1024).toFixed(2)} KB</small>
			</div>
			<button
				onClick={onClear}
				style={{
					backgroundColor: "#dc3545",
					color: "white",
					border: "none",
					borderRadius: "4px",
					padding: "8px 12px",
					cursor: "pointer",
				}}
			>
				<X size={16} style={{ marginRight: "4px" }} />
				Очистить
			</button>
		</div>
	);
};

export default FileInfo;
