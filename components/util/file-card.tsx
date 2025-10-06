import React from 'react';
import { Icon } from './icon';

interface FileCardProps {
  file: {
    type: string;
    path: string;
  };
  variant?: 'thumbnail' | 'button';
}

export const FileCard: React.FC<FileCardProps> = ({ file, variant = 'button' }) => {
  const getFileIcon = (type: string, path: string) => {
    const fileType = type?.toLowerCase() || '';
    const extension = path?.split('.').pop()?.toLowerCase() || '';

    if (fileType.includes('description') || extension === 'pdf') return 'TbFileText';
    if (fileType.includes('xrf') || fileType.includes('data') || extension === 'xlsx' || extension === 'csv') return 'TbFileSpreadsheet';
    if (fileType.includes('image') || ['jpg', 'jpeg', 'png', 'gif'].includes(extension)) return 'TbPhoto';
    return 'TbFile';
  };

  const getFileName = (type: string, path: string) => {
    if (type) {
      return type.split('-').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    }
    return path?.split('/').pop() || 'File';
  };

  const isImage = (type: string, path: string) => {
    const fileType = type?.toLowerCase() || '';
    const extension = path?.split('.').pop()?.toLowerCase() || '';
    return fileType.includes('image') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(extension);
  };

  const imageUrl = isImage(file.type, file.path) ? `/api/file/${file.path}` : null;

  if (variant === 'thumbnail') {
    return (
      <a
        href={`/api/file/${file.path}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block border border-base-300 rounded-lg overflow-hidden hover:shadow-lg hover:border-primary transition-all duration-200 bg-base-100 group no-underline m-0"
        onClick={(e) => e.stopPropagation()}
      >
        {imageUrl ? (
          <div className="relative w-full aspect-square overflow-hidden bg-black">
            <div className="absolute inset-0 flex items-center justify-center spinner-container">
              <Icon name="BiLoaderAlt" className="w-8 h-8 text-white animate-spin" />
            </div>
            <img
              src={imageUrl}
              alt={getFileName(file.type, file.path)}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-200 opacity-0 m-0"
              onLoad={(e) => {
                const img = e.target as HTMLImageElement;
                img.classList.remove('opacity-0');
                const spinner = img.parentElement?.querySelector('.spinner-container') as HTMLElement;
                if (spinner) {
                  spinner.style.display = 'none';
                }
              }}
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                const container = img.parentElement as HTMLElement;
                img.style.display = 'none';
                const spinner = container.querySelector('.spinner-container') as HTMLElement;
                if (spinner) {
                  spinner.style.display = 'none';
                }
                container.classList.remove('bg-black');
                container.classList.add('bg-base-200', 'flex', 'items-center', 'justify-center');
                const fallback = container.nextElementSibling as HTMLElement;
                if (fallback) {
                  fallback.style.display = 'flex';
                  container.style.display = 'none';
                }
              }}
            />
          </div>
        ) : null}
        <div className={`w-full aspect-square flex items-center justify-center bg-base-200 ${imageUrl ? 'hidden' : 'flex'}`}>
          <Icon
            name={getFileIcon(file.type, file.path)}
            className="w-12 h-12 text-base-content/60"
          />
        </div>
        <div className="p-2 bg-base-100 min-h-[3rem] flex items-center justify-center border-t border-base-200">
          <span className="text-xs text-center leading-tight break-words">{getFileName(file.type, file.path)}</span>
        </div>
      </a>
    );
  }

  // Button variant (default)
  return (
    <a
      href={`/api/file/${file.path}`}
      target="_blank"
      rel="noopener noreferrer"
      className="btn btn-outline flex flex-col items-center justify-center p-3 min-w-20 h-auto min-h-20 no-underline hover:bg-primary hover:text-white"
      onClick={(e) => e.stopPropagation()}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={getFileName(file.type, file.path)}
          className="w-16 h-16 object-cover mb-1 flex-shrink-0"
          onLoad={(e) => {
            const img = e.target as HTMLImageElement;
            if (img.naturalHeight > img.naturalWidth) {
              img.style.transform = 'rotate(90deg)';
              img.style.width = '64px';
              img.style.height = '64px';
            }
          }}
          onError={(e) => {
            const img = e.target as HTMLImageElement;
            img.style.display = 'none';
            const icon = img.nextElementSibling as HTMLElement;
            if (icon) icon.style.display = 'block';
          }}
        />
      ) : null}
      <Icon
        name={getFileIcon(file.type, file.path)}
        className={`w-6 h-6 mb-1 flex-shrink-0 ${imageUrl ? 'hidden' : 'block'}`}
      />
      <span className="text-xs text-center leading-tight break-words">{getFileName(file.type, file.path)}</span>
    </a>
  );
};
