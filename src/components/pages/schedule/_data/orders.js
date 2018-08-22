import moment from 'moment';

const now = moment();

const orders = [
    {
        id: 'order-1',
        productId: 'product-1',
        quantity: 500,
        dateDue: now.clone().add(1, 'day')
    },
    {
        id: 'order-2',
        productId: 'product-5',
        quantity: 1000,
        dateDue: now.clone().add(3, 'days')
    },
    {
        id: 'order-3',
        productId: 'product-1',
        quantity: 100,
        dateDue: now.clone().add(5, 'days')
    },
    {
        id: 'order-4',
        productId: 'product-2',
        quantity: 800,
        dateDue: now.clone().add(2, 'days')
    },
    {
        id: 'order-5',
        productId: 'product-4',
        quantity: 100,
        dateDue: now.clone().add(3, 'days')
    },
    {
        id: 'order-6',
        productId: 'product-3',
        quantity: 200,
        dateDue: now.clone().add(10, 'days')
    },
    {
        id: 'order-7',
        productId: 'product-3',
        quantity: 200,
        dateDue: now.clone().subtract(1, 'week')
    }
];

export default orders;