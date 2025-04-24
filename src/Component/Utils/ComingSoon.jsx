import React from "react";

const ComingSoon = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 py-10">
            <h1 className="text-4xl font-bold text-blue-700 mb-4">🚧 Coming Soon</h1>
            <p className="text-lg text-gray-600 text-center max-w-xl">
                This feature is currently under development and will be available in a future update.
                Please check back later!
            </p>
        </div>
    );
};

export default ComingSoon;