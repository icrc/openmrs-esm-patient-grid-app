import React, { ReactNode } from 'react';
import { Button, Tag } from '@carbon/react';
import { Close } from '@carbon/react/icons';
import styles from './CloseableTag.scss';

// TODO: If Carbon ever releases typings, replace the Record with "TagProps".
export interface CloseableTagProps extends Record<string, unknown> {
  children?: ReactNode;
  iconDescription?: string;
  onClose?(): void;
}

export function CloseableTag({ children, iconDescription, onClose, ...tagProps }: CloseableTagProps) {
  return (
    <Tag {...tagProps}>
      {children}
      <Button
        className={styles.closeButton}
        kind="ghost"
        renderIcon={Close}
        iconDescription={iconDescription ?? ''}
        hasIconOnly
        onClick={onClose}
      />
    </Tag>
  );
}
