// Copyright 2019-2022 @polkadot/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback, useContext } from 'react';
import styled from 'styled-components';

import failStatus from '@polkadot/extension-koni-ui/assets/fail-status.svg';
import successStatus from '@polkadot/extension-koni-ui/assets/success-status.svg';
import { ActionContext } from '@polkadot/extension-koni-ui/components';
import Button from '@polkadot/extension-koni-ui/components/Button';
import useTranslation from '@polkadot/extension-koni-ui/hooks/useTranslation';
import { ThemeProps, TxResult } from '@polkadot/extension-koni-ui/types';
import { getScanExplorerTransactionHistoryUrl, isSupportScanExplorer } from '@polkadot/extension-koni-ui/util';

export interface Props extends ThemeProps {
  className?: string;
  txResult: TxResult;
  networkKey: string;
  onResend: () => void
}

function getErrorMessage (txError?: Error | null): string | null {
  if (!txError) {
    return null;
  }

  if (txError.message) {
    return txError.message;
  }

  return null;
}

function SendFundResult ({ className = '', networkKey, onResend, txResult: { extrinsicHash, isTxSuccess, txError } }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const navigate = useContext(ActionContext);
  const _backToHome = useCallback(
    () => {
      navigate('/');
    },
    [navigate]
  );

  const viewTransactionBtn = (networkKey: string, extrinsicHash: string) => {
    if (isSupportScanExplorer(networkKey)) {
      return (
        <a
          className='send-fund-result__stt-btn send-fund-result__view-history-btn'
          href={getScanExplorerTransactionHistoryUrl(networkKey, extrinsicHash)}
          rel='noreferrer'
          target={'_blank'}
        >
          {t<string>('View Transaction')}
        </a>
      );
    }

    return (
      <span className='send-fund-result__stt-btn send-fund-result__view-history-btn -disabled'>
        {t<string>('View Transaction')}
      </span>
    );
  };

  const errorMessage = getErrorMessage(txError);

  return (
    <div className={`send-fund-result-wrapper ${className}`}>
      {isTxSuccess
        ? <div className='send-fund-result'>
          <img
            alt='success'
            className='send-fund-result__status-img'
            src={successStatus}
          />
          <div className='send-fund-result__stt-text'>{t<string>('Send Fund Successful')}</div>
          <div
            className='send-fund-result__stt-subtext'
          >{t<string>('Your request has been confirmed. You can track its progress on the Transaction History page.')}</div>
          <Button
            className='send-fund-result__stt-btn'
            onClick={_backToHome}
          >
            {t<string>('Back To Home')}
          </Button>
          {extrinsicHash && viewTransactionBtn(networkKey, extrinsicHash)}
        </div>
        : <div className='send-fund-result'>
          <img
            alt='fail'
            className='send-fund-result__status-img'
            src={failStatus}
          />
          <div className='send-fund-result__stt-text'>{t<string>('Send Fund Fail')}</div>
          <div className='send-fund-result__stt-subtext'>
            {extrinsicHash
              ? (t<string>('There was a problem with your request. You can track its progress on the Transaction History page.'))
              : (t<string>('There was a problem with your request.'))
            }
            {errorMessage && (
              <div className={'send-fund-result__text-danger'}>{errorMessage}</div>
            )}
          </div>
          <Button
            className='send-fund-result__stt-btn'
            onClick={onResend}
          >
            {t<string>('Resend')}
          </Button>
          {extrinsicHash && viewTransactionBtn(networkKey, extrinsicHash)}
        </div>
      }
    </div>
  );
}

export default React.memo(styled(SendFundResult)(({ theme }: ThemeProps) => `
  margin: 20px 45px 0;

  .send-fund-result {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .send-fund-result__status-img {
    width: 120px;
    margin-top: 10px;
    margin-bottom: 32px;
  }

  .send-fund-result__stt-text {
    font-size: 20px;
    line-height: 36px;
    color: ${theme.textColor};
    font-weight: 500;
  }

  .send-fund-result__stt-subtext {
    color: ${theme.textColor};
    margin-bottom: 30px;
    text-align: center;
    font-size: 14px;
  }

  .send-fund-result__stt-btn {
    margin-bottom: 10px;
  }

  .send-fund-result__text-danger {
    color: ${theme.iconDangerColor};
  }

  .send-fund-result__stt-btn > .children {
    font-weight: 500;
  }

  .send-fund-result__view-history-btn {
    background-color: ${theme.buttonBackground2};
    color: ${theme.buttonTextColor3};
    cursor: pointer;
    display: flex;
    width: 100%;
    height: 48px;
    box-sizing: border-box;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    line-height: 26px;
    padding: 0 1rem;
    position: relative;
    text-align: center;
    text-decoration: none;
    align-items: center;
    justify-content: center;
    font-weight: 500;

    &.-disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }
  }
`));
