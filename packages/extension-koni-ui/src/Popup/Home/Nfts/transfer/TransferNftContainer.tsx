// Copyright 2019-2022 @polkadot/extension-koni authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { t } from 'i18next';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

import { ApiPromise } from '@polkadot/api';
import { isValidAddress } from '@polkadot/extension-koni-base/utils/utils';
import logo from '@polkadot/extension-koni-ui/assets/sub-wallet-logo.svg';
import { ActionContext, Button, Spinner } from '@polkadot/extension-koni-ui/components';
import LoadingContainer from '@polkadot/extension-koni-ui/components/LoadingContainer';
import useToast from '@polkadot/extension-koni-ui/hooks/useToast';
import { Header } from '@polkadot/extension-koni-ui/partials';
import paramsHandler from '@polkadot/extension-koni-ui/Popup/Home/Nfts/api/paramsHandler';
import transferHandler from '@polkadot/extension-koni-ui/Popup/Home/Nfts/api/transferHandler';
import AuthTransfer from '@polkadot/extension-koni-ui/Popup/Home/Nfts/transfer/AuthTransfer';
import TransferResult from '@polkadot/extension-koni-ui/Popup/Home/Nfts/transfer/TransferResult';
import { _NftItem, SubstrateTransferParams, SUPPORTED_TRANSFER_EVM_CHAIN, SUPPORTED_TRANSFER_SUBSTRATE_CHAIN, Web3TransferParams } from '@polkadot/extension-koni-ui/Popup/Home/Nfts/types';
import InputAddress from '@polkadot/extension-koni-ui/Popup/Sending/old/component/InputAddress';
import LabelHelp from '@polkadot/extension-koni-ui/Popup/Sending/old/component/LabelHelp';
import useApi from '@polkadot/extension-koni-ui/Popup/Sending/old/hook/useApi';
import { RootState } from '@polkadot/extension-koni-ui/stores';
import { CurrentAccountType } from '@polkadot/extension-koni-ui/stores/types';
import { ThemeProps } from '@polkadot/extension-koni-ui/types';

interface Props extends ThemeProps {
  className?: string;
}

interface ContentProps {
  className?: string;
  nftItem: _NftItem;
  api: ApiPromise;
  isApiReady: boolean;
  collectionImage?: string;
  collectionId: string;
}

function Wrapper ({ className = '' }: Props): React.ReactElement<Props> {
  const { currentNetwork, transferNftParams } = useSelector((state: RootState) => state);
  const { api, isApiReady } = useApi(currentNetwork.networkKey);

  return (
    <div className={className}>
      <Header
        showAdd
        // showCancelButton
        showSearch
        showSettings
        showSubHeader
        subHeaderName={'Send NFT'}
      />
      {
        isApiReady || currentNetwork.isEthereum
          ? (
            <TransferNftContainer
              api={api}
              collectionId={transferNftParams.collectionId}
              collectionImage={transferNftParams.collectionImage}
              isApiReady={isApiReady}
              nftItem={transferNftParams.nftItem}
            />
          )
          : (
            <LoadingContainer />
          )
      }
    </div>
  );
}

function TransferNftContainer ({ api, className, collectionId, collectionImage, isApiReady, nftItem }: ContentProps): React.ReactElement<ContentProps> {
  const [recipientAddress, setRecipientAddress] = useState<string | null>('');
  const [addressError, setAddressError] = useState(true);
  const { currentAccount: account, currentNetwork } = useSelector((state: RootState) => state);
  const [currentAccount] = useState<CurrentAccountType>(account);
  const networkKey = nftItem.chain as string;

  // for substrate-based chains
  const [substrateTransferParams, setSubstrateTransferParams] = useState<SubstrateTransferParams | null>(null);

  // for evm-based chains
  const [web3TransferParams, setWeb3TransferParams] = useState<Web3TransferParams | null>(null);
  const [loading, setLoading] = useState(false);

  const [showConfirm, setShowConfirm] = useState(false);
  const [showTransferResult, setShowTransferResult] = useState(false);

  const [extrinsicHash, setExtrinsicHash] = useState('');
  const [isTxSuccess, setIsTxSuccess] = useState(false);
  const [txError, setTxError] = useState('');

  const [showImage, setShowImage] = useState(true);
  const [imageError, setImageError] = useState(false);

  const navigate = useContext(ActionContext);
  const { show } = useToast();

  useEffect(() => { // handle user change account during sending process
    if (account.account?.address !== currentAccount.account?.address) {
      navigate('/');
    }
  }, [account, currentAccount.account?.address, navigate]);

  const handleResend = useCallback(() => {
    setExtrinsicHash('');
    setIsTxSuccess(false);
    setTxError('');
    setShowTransferResult(false);
    setShowConfirm(true);
  }, []);

  const goBack = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const isEthereumAddress = useCallback((): boolean => {
    // @ts-ignore
    return SUPPORTED_TRANSFER_EVM_CHAIN.indexOf(networkKey) > -1;
  }, [networkKey]);

  useEffect(() => {
    setAddressError(!isValidAddress(recipientAddress as string) && !isEthereumAddress());
  }, [isEthereumAddress, recipientAddress]);

  const handleSend = useCallback(async () => {
    if (addressError || !isApiReady || !networkKey) {
      return;
    }

    if (networkKey !== currentNetwork.networkKey) {
      show(`Please change to ${networkKey.toUpperCase()} network.`);

      return;
    }

    setLoading(true);
    // @ts-ignore
    const senderAddress = currentAccount.account.address;
    const params = paramsHandler(nftItem, networkKey);
    const transferMeta = await transferHandler(api, networkKey, senderAddress, recipientAddress as string, params);

    if (transferMeta !== null) {
      // @ts-ignore
      if (SUPPORTED_TRANSFER_SUBSTRATE_CHAIN.indexOf(networkKey) > -1) {
        setSubstrateTransferParams({
          // @ts-ignore
          extrinsic: transferMeta.extrinsic,
          txInfo: transferMeta.info
        });
        // @ts-ignore
      } else if (SUPPORTED_TRANSFER_EVM_CHAIN.indexOf(networkKey) > -1) {
        setWeb3TransferParams({
          rawTx: transferMeta.web3RawTx,
          estimatedGas: transferMeta.estimatedGas
        } as Web3TransferParams);
      }

      setShowConfirm(true);
    } else {
      show('Some error occurred. Please try again later.');
    }

    setLoading(false);
  }, [addressError, api, currentAccount.account?.address, currentNetwork.networkKey, isApiReady, networkKey, nftItem, recipientAddress, show]);

  const handleImageError = useCallback(() => {
    setLoading(false);
    setShowImage(false);
  }, []);

  const getItemImage = useCallback(() => {
    if (nftItem.image && !imageError) {
      return nftItem.image;
    } else if (collectionImage) {
      return collectionImage;
    }

    return logo;
  }, [collectionImage, nftItem, imageError]);

  const handleVideoError = useCallback(() => {
    setImageError(true);
    setShowImage(true);
  }, []);

  return (
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    <div className={`${className} transfer-container`}>
      {
        !showTransferResult &&
        <div>
          <div className={'img-container'}>
            {
              showImage
                ? <img
                  alt={'item-img'}
                  className={'item-img'}
                  onError={handleImageError}
                  src={getItemImage()}
                  style={{ borderRadius: '5px' }}
                />
                : <video
                  autoPlay
                  height='416'
                  loop={true}
                  onError={handleVideoError}
                  width='100%'
                >
                  <source
                    src={getItemImage()}
                    type='video/mp4'
                  />
                </video>
            }
          </div>
          <div>
            <a className='address-text'>
              {t<string>('Send to address')}
            </a>
            <LabelHelp
              className = 'send-help'
              help= {t<string>('Select a contact or paste the address you want to send NFTs to.')}
            />
            <InputAddress
              autoPrefill={false}
              className={'kn-field -field-2'}
              // help={'Select a contact or paste the address you want to send nft to.'}
              isEthereum={isEthereumAddress()}
              // isDisabled={!!propRecipientId}
              // label={'Send to address'}
              onChange={setRecipientAddress}
              type='allPlus'
              withEllipsis
            />
          </div>
          <div className={'transfer-meta'}>
            <div className={'meta-title'}>
              <div>NFT</div>
              <div>Chain</div>
            </div>
            <div className={'meta-value'}>
              {/* eslint-disable-next-line @typescript-eslint/restrict-plus-operands */}
              <div>{nftItem.name ? nftItem.name : '#' + nftItem.id}</div>
              <div style={{ textTransform: 'uppercase' }}>{nftItem?.chain}</div>
            </div>
          </div>
          <div className={'kn-l-submit-wrapper'}>
            <Button
              className={'cancel-btn'}
              to='/'
            >
              {t<string>('cancel')}
            </Button>
            <div
              className={'send-button-default ' + (addressError ? 'inactive-button' : 'active-button')}
              // eslint-disable-next-line @typescript-eslint/no-misused-promises
              onClick={handleSend}
            >
              {
                !loading
                  ? <span className='_send'>{t<string>('Send')}</span>
                  : <Spinner className={'spinner-loading'} />
              }
            </div>
          </div>
        </div>
      }
      {
        showConfirm && isApiReady && (substrateTransferParams || web3TransferParams) &&
          <AuthTransfer
            chain={nftItem.chain}
            collectionId={collectionId}
            nftItem={nftItem}
            recipientAddress={recipientAddress}
            senderAccount={currentAccount?.account}
            setExtrinsicHash={setExtrinsicHash}
            setIsTxSuccess={setIsTxSuccess}
            setShowConfirm={setShowConfirm}
            setShowResult={setShowTransferResult}
            setTxError={setTxError}
            showResult={showTransferResult}
            substrateTransferParams={substrateTransferParams}
            web3TransferParams={web3TransferParams}
          />
      }
      {
        showTransferResult && extrinsicHash !== '' &&
        <TransferResult
          backToHome={goBack}
          extrinsicHash={extrinsicHash}
          handleResend={handleResend}
          isTxSuccess={isTxSuccess}
          networkKey={networkKey}
          txError={txError}
        />
      }
    </div>
  );
}

export default React.memo(styled(Wrapper)(({ theme }: Props) => `
  .img-container {
    display: flex;
    width: 100%;
    justify-content: center;
    margin-bottom: 20px;
  }

  .item-img {
    display: block;
    height: 130px;
    width: 130px;
    border-radius: 5px;
    text-align: center;
    object-fit: contain;
  }

  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100vh;

  .transfer-container {
    padding-left: 15px;
    padding-right: 15px;
    padding-bottom: 15px;
    padding-top: 25px;
  }

  .spinner-loading {
    position: relative;
    height: 26px;
    width: 26px;
    margin-left:120px;
    margin-top:14px;
  }

  .inactive-button {
    opacity: 0.5;
  }

  .active-button {
    cursor: pointer;
  }
  .send-button-default {
    display: inline-block;
    height: 48px;
    width: 256px;
    border-radius: 6px;
    background: rgba(40, 78, 169, 1);
  }
  .address-warning {
    color: red;
    font-size: 12px;
  }

  .transfer-meta {
    display: flex;
    justify-content: space-between;
    border: 2px dashed #212845;
    box-sizing: border-box;
    border-radius: 8px;
    padding: 10px;
    margin-top: 20px;
  }

  .meta-title {
    font-size: 14px;
    color: #7B8098;
  }

  .meta-value {
    text-align: right;
    font-size: 14px;
  }

  .field-container {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .field-title {
    text-transform: uppercase;
    font-size: 12px;
    color: #7B8098;
  }

  .input-value {
    background-color: ${theme.popupBackground};
    border-radius: 8px;
    padding: 10px 15px;
    font-size: 15px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    outline: none;
    border: 1px solid #181E42;
    color: ${theme.textColor};
  }

  .header {
    width: 100%;
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
    font-size: 24px;
    font-weight: 500;
    line-height: 36px;
    font-style: normal;
  }

  .close-button {
    font-size: 20px;
    cursor: pointer;
  }
  .send-help {
    color: #FDFDFD;
    opacity: 0.5;
  }
  .address-text {
    font-family: 'Roboto';
    font-style: normal;
    font-weight: 700;
    font-size: 14px;
    line-height: 100%;
    letter-spacing: 0.03em;
    color: #FFFFF;
  }
  .kn-l-submit-wrapper {
    display:flex;
    z-index:6;
    position: sticky;
    bottom: -15px;
    padding: 15px 0px;
    margin-left: -15px;
    margin-bottom: -15px;
    margin-right: -15px;
    background-color: ${theme.background};
  }
  .cancel-btn {
    display: inline-block;
    margin-right: 28px;
    margin-left: 15px;
    height: 48px;
    width: 144px;
    background: rgba(48, 59, 87, 1);
    border-radius: 6px;
  }
  ._send {
    font-family: Lexend;
    font-style: normal;
    font-weight: 500;
    line-height: 100%;
    display: flex;
    align-items: center;
    text-align: center;
    letter-spacing: 0.03em;
    padding:15px 100px;
    color: #FFFFFF;
  }
`));
