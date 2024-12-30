import {loadConnectAndInitialize} from '@stripe/connect-js';

const fetchClientSecret = async () => {
    return 'accs_secret__RKuohJIxpuW6BsXl94Pnt1mw38Mlfi84N4KXJahYxkITml9';

}

const stripeConnectInstance = loadConnectAndInitialize({
  // This is a placeholder - it should be replaced with your publishable API key.
  // Sign in to see your own test API key embedded in code samples.
  // Don’t submit any personally identifiable information in requests made with this key.
  publishableKey: "pk_test_51QAJlcCtaC1fmjOuyXIp205KqLBJ46iG68wHtcBFhzPE78SFSo59aIbUCv5DD1N6m59yCyHzyq704TFbRVPkSrDA00IUvXth5I",
  fetchClientSecret: fetchClientSecret,
});
const paymentComponent = stripeConnectInstance.create("payments");
const container = document.getElementById("container");
container.appendChild(paymentComponent);
