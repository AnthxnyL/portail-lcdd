<script setup>
  import { provide, useAttrs } from "vue";
	
  useHead({
    link: [
      { rel: 'icon', type: 'image/png', href: '/favicon.ico' }
    ]
  })
  const qrCode = useQrCode();
  provide('qrCode', qrCode);
  const shopifyApi = useShopifyApi();
  provide('shopifyApi', shopifyApi);
  const whitelist = useWhitelist();
  provide('whitelist', whitelist);
  const auth = useAuth();
  provide('auth', auth);
  const profil = useProfil();
  provide('profil', profil);
  const sales = useSales();
  provide('sales', sales);
  const popup = usePopup();
  provide('popup', popup);
  const searchBar = useSearchbar();
  provide('searchBar', searchBar);
  const transaction = useTransaction();
  provide('transaction', transaction);
  const iban = useIban();
  provide('iban', iban);
  const withdraw = useWithdraw();
  provide('withdraw', withdraw);
  const admin = useAdmin();
  provide('admin', admin);
  const email = useEmail();
  provide('email', email);
  const wallet = useWallet();
  provide('wallet', wallet);
</script>


<template>
  <div>
    <NuxtPage />
  </div>
</template>
