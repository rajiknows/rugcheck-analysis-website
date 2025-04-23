import { RiskLevel } from "@/types/token";
import { cn } from "@/lib/utils";

interface TokenRiskScoreProps {
    riskLevel: RiskLevel;
    showDetails?: boolean;
    className?: string;
}

export default function TokenRiskScore({
    riskLevel,
    showDetails = false,
    className,
}: TokenRiskScoreProps) {
    const { level, score, description } = riskLevel;

    const getBgColor = () => {
        switch (level) {
            case "low":
                return "bg-risk-low";
            case "medium":
                return "bg-risk-medium";
            case "high":
                return "bg-risk-high";
            case "critical":
                return "bg-risk-critical animate-pulse-warning";
            default:
                return "bg-muted";
        }
    };

    const getTextColor = () => {
        switch (level) {
            case "low":
            case "medium":
                return "text-black";
            case "high":
            case "critical":
                return "text-white";
            default:
                return "text-foreground";
        }
    };

    const getLabel = () => {
        switch (level) {
            case "low":
                return "Low Risk";
            case "medium":
                return "Medium Risk";
            case "high":
                return "High Risk";
            case "critical":
                return "Critical Risk";
            default:
                return "Unknown Risk";
        }
    };

    return (
        <div className={cn("flex flex-col", className)}>
            <div className="flex items-center space-x-2">
                <div
                    className={cn(
                        "px-3 py-1 rounded-md font-medium text-sm",
                        getBgColor(),
                        getTextColor(),
                    )}
                >
                    {getLabel()}
                </div>
                <span className="text-sm text-muted-foreground">
                    Score: {score}/100
                </span>
            </div>

            {showDetails && (
                <p className="mt-2 text-sm text-muted-foreground">
                    {description}
                </p>
            )}
        </div>
    );
}
