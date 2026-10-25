import React from 'react';

type IconProps = { size?: number; className?: string };

export const GamepadSkull: React.FC<IconProps> = ({ size = 128, className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="112 60 136 156"
    width={size}
    height={(size * 156) / 136}
    className={className}
    fill="currentColor"
    fillRule="evenodd"
    role="img"
    aria-label="Gamepad robot skull"
  >
    <path
      d="M134 84 L146 68 L168 68 L168 88 L192 88 L192 68 L214 68 L226 84
         L226 112 L240 120 L240 152 L226 160 L226 176 L216 186 L216 192
         L144 192 L144 186 L134 176 L134 160 L120 152 L120 120 L134 112 Z
         M144 126 L216 126 Q224 126 224 134 L224 150 Q224 158 216 158
         L144 158 Q136 158 136 150 L136 134 Q136 126 144 126 Z
         M153 133 L159 133 L159 139 L165 139 L165 145 L159 145 L159 151
         L153 151 L153 145 L147 145 L147 139 L153 139 Z
         M196 139 L214 139 L214 145 L196 145 Z"
    />
    <rect x="177" y="126" width="6" height="32" />
    <path d="M124 128 L132 128 L132 131 L124 131 Z M228 128 L236 128 L236 131 L228 131 Z" fillRule="evenodd" fill="#fff" opacity="0" />
    <rect x="146" y="195" width="8" height="13" />
    <rect x="160" y="195" width="8" height="13" />
    <rect x="173" y="195" width="14" height="13" />
    <rect x="192" y="195" width="8" height="13" />
    <rect x="206" y="195" width="8" height="13" />
  </svg>
);

export default GamepadSkull;
