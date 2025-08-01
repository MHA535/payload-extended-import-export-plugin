import { Dropzone } from "@payloadcms/ui";
import { FileUpIcon, FileText, Database } from "lucide-react";
import React from "react";

interface FileUploadProps {
	onFileChange: (files: FileList) => void;
	inputRef: React.RefObject<HTMLInputElement | null>;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileChange, inputRef }) => {
	return (
		<div style={{ marginBottom: "24px" }}>
			<Dropzone onChange={onFileChange} className="dropzone">
				<div
					style={{
						width: "100%",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						flexDirection: "column",
						gap: "1rem",
						height: "250px",
						border: "2px dashed #d1d5db",
						borderRadius: "12px",
						backgroundColor: "#f9fafb",
						position: "relative",
						transition: "all 0.2s ease",
					}}
				>
					<div
						style={{
							width: "64px",
							height: "64px",
							borderRadius: "50%",
							backgroundColor: "#e0e7ff",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						<FileUpIcon size={28} color="#3b82f6" />
					</div>

					<div style={{ textAlign: "center" }}>
						<h3
							style={{
								margin: "0 0 8px 0",
								fontSize: "18px",
								fontWeight: "600",
								color: "#111827",
							}}
						>
							Загрузите файл для импорта
						</h3>
						<p
							style={{
								margin: "0 0 16px 0",
								fontSize: "14px",
								color: "#6b7280",
							}}
						>
							Перетащите файл сюда или нажмите для выбора
						</p>
					</div>

					<div
						style={{
							display: "flex",
							gap: "16px",
							alignItems: "center",
							fontSize: "12px",
							color: "#6b7280",
						}}
					>
						<div
							style={{
								display: "flex",
								alignItems: "center",
								gap: "4px",
							}}
						>
							<FileText size={16} />
							<span>CSV</span>
						</div>
						<div
							style={{
								display: "flex",
								alignItems: "center",
								gap: "4px",
							}}
						>
							<Database size={16} />
							<span>JSON</span>
						</div>
						<div
							style={{
								display: "flex",
								alignItems: "center",
								gap: "4px",
							}}
						>
							<FileText size={16} />
							<span>XLSX</span>
						</div>
					</div>

					<input
						ref={inputRef}
						type="file"
						accept=".csv,.json,.xlsx,.xls"
						style={{
							position: "absolute",
							opacity: 0,
							width: "100%",
							height: "100%",
							cursor: "pointer",
						}}
						onChange={(e) => {
							if (e.target.files) {
								onFileChange(e.target.files);
							}
						}}
					/>
				</div>
			</Dropzone>

			<div
				style={{
					marginTop: "16px",
					padding: "12px",
					backgroundColor: "#fef3c7",
					border: "1px solid #f59e0b",
					borderRadius: "8px",
					fontSize: "14px",
					color: "#92400e",
				}}
			>
				<strong>📝 Поддерживаемые форматы:</strong>
				<ul style={{ margin: "8px 0 0 0", paddingLeft: "20px" }}>
					<li>
						<strong>CSV</strong> - текстовые файлы с разделителями
					</li>
					<li>
						<strong>JSON</strong> - структурированные данные в
						формате JSON
					</li>
					<li>
						<strong>XLSX</strong> - файлы Microsoft Excel
					</li>
				</ul>
			</div>
		</div>
	);
};

export default FileUpload;
