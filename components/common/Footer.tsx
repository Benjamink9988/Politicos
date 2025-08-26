
import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="w-full bg-background text-center text-xs text-text-secondary py-4 border-t border-gray-200 mt-auto">
            <p className="mb-1">
                본 결과물은 AI에 의해 생성되었으므로, 중요 의사결정 시에는 반드시 팩트체크를 하시기 바랍니다.
            </p>
            <p>
                &copy; 2025 Politicos. | 연락처: <a href="mailto:uplus50@gmail.com" className="text-primary hover:underline">uplus50@gmail.com</a>
            </p>
        </footer>
    );
};

export default Footer;
