import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";

function FlashSell() {
    const navigate = useNavigate();

    return (
        <Button
            size="sm"
            variant="outline"
            onClick={() => navigate("/flash-sell")}
            className="flex items-center gap-2 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/20"
        >
            <Zap className="h-4 w-4" />
            Flash Sell
        </Button>
    );
}

export default FlashSell;

