/* eslint-disable no-console */
export const Stripe = {
    components: [],
    get(type, key) {
        return this.components.find(i => i.type === type && i.key === key);
    }
};

export const baseStyle = {
    base: {
        color: "#32325d",
        fontFamily: "Roboto",
        fontSmoothing: "antialiased",
        fontSize: "16px",
        "::placeholder": {
            color: "#aab7c4"
        }
    },
    invalid: {
        color: "#fa755a",
        iconColor: "#fa755a"
    }
};

function init(elementType, key, stripeOptions = {}) {
    const component = Stripe.get(elementType, key) || {
        instance: null,
        type: elementType,
        key: key,
        elements: null,
        element: null
    };

    if (typeof key === "object" && typeof key.elements === "function") {
        component.instance = key;
    }

    if (window.Stripe === undefined && component.instance === null) {
        console.error("Stripe V3 library not loaded!");
    } else if (component.instance === null) {
        component.instance = window.Stripe(key, stripeOptions);
    }

    if (!component.instance.elements) {
        console.error("Stripe V3 library not loaded!");
    }

    return component;
}

export function create({
                           elementType,
                           stripeKey,
                           stripeOptions = {},
                           elsOptions = {},
                           elOptions = {}
                       }) {
    let component = init(elementType, stripeKey, stripeOptions);
    const elements = component.instance.elements(elsOptions);

    elOptions.style = Object.assign(baseStyle, elOptions.style || {});

    component = Object.assign({}, component, {
        elements,
        element: elements.create(elementType, elOptions),
        createToken: tokenData => component.instance.createToken(component.element, tokenData),
        createSource: sourceData => component.instance.createSource(component.element, sourceData),
        retrieveSource: source => component.instance.retrieveSource(source),
        paymentRequest: options => component.instance.paymentRequest(options),
        redirectToCheckout: options => component.instance.redirectToCheckout(options),
        retrievePaymentIntent: clientSecret => component.instance.retrievePaymentIntent(clientSecret),
        handleCardPayment: (clientSecret, data) => component.instance.handleCardPayment(clientSecret, component.element, data),
        handleCardSetup: (clientSecret, data) => component.instance.handleCardSetup(clientSecret, component.element, data),
        handleCardAction: clientSecret => component.instance.handleCardAction(clientSecret),
        confirmPaymentIntent: (clientSecret, data) => component.instance.confirmPaymentIntent(clientSecret, component.element, data),
        createPaymentMethod: (cardType, data) => component.instance.createPaymentMethod(cardType, component.element, data),
        confirmCardPayment: (clientSecret, data) => component.instance.confirmCardPayment(clientSecret, data),
        confirmSepaDebitPayment: (clientSecret, data) => component.instance.confirmSepaDebitPayment(clientSecret, data)
    });

    Stripe.components.push(component);

    return component;
}

export function destroy(type, key) {
    const idx = Stripe.components.findIndex(
        i => i.type === type && i.key === key
    );
    if (idx > -1) {
        Stripe.components = [
            ...Stripe.components.slice(0, idx),
            ...Stripe.components.slice(idx + 1)
        ];
    }
}

export function destroyAll() {
    Stripe.components = {};
}
