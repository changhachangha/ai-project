import { Loader } from 'lucide-react';

export default function Loading() {
    return (
        <div className="flex justify-center items-center h-full">
            <Loader className="w-12 h-12 animate-spin text-primary" />
        </div>
    );
}
