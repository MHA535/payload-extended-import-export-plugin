import React from "react";

interface LoadingStateProps {
	isLoading: boolean;
}

const LoadingState: React.FC<LoadingStateProps> = ({ isLoading }) => {
	if (!isLoading) return null;

	return (
		<div
			style={{
				textAlign: "center",
				padding: "20px",
			}}
		>
			<div>Загрузка и обработка файла...</div>
		</div>
	);
};

export default LoadingState;
