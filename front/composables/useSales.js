import { differenceInDays } from 'date-fns';
import { ref, reactive, computed, onMounted, watch } from 'vue';
import useIban from '@/composables/useIban';


export default function () {

    const { $axios } = useNuxtApp()
    let token = null
    if (typeof window !== 'undefined' && window.localStorage) {
        token = localStorage.getItem('token')
    }
    const data = ref(null);
    const salesData = reactive([]);

    const withdraw = ref(0);

    const { getVendorByUserId, vendorId } = useIban()

    const myProfile = ref(null);
    if (process.client) {
        const userProfile = localStorage.getItem('user');
        if (userProfile) {
            myProfile.value = JSON.parse(userProfile);
        }
    }


    const isAtMinDate = ref(false);  // Indicateur si l'on est à la date minimale
    const isAtMaxDate = ref(false);  // Indicateur si l'on est à la date maximale
    const minDate = ref(null);
    const maxDate = ref(null);

    const isCooldownActive = ref(false);
    const clickDuringCooldown = ref(false);

    const startCooldown = () => {
        isCooldownActive.value = true;
        setTimeout(() => {
            isCooldownActive.value = false;
            clickDuringCooldown.value = false;
        }, 1100);
    };

    const period = ref('month');
    // const salesData = reactive([
    //     { orderAmount: 100, orderDate: "2025-02-07T10:56:41+01:00" },
    //     { orderAmount: 200, orderDate: "2025-03-15T10:56:41+01:00" },
    //     { orderAmount: 100, orderDate: "2023-02-07T10:56:41+01:00" },
    //     { orderAmount: 200, orderDate: "2025-03-16T10:56:41+01:00" },
    //     { orderAmount: 200, orderDate: "2025-03-15T10:56:41+01:00" },
    //     { orderAmount: 300, orderDate: "2024-05-12T10:56:41+01:00" },
    //     { orderAmount: 150, orderDate: "2024-06-19T10:56:41+01:00" },
    // ]);
    
    const selectedDate = ref(new Date());

    const setSelectedDate = (newDate) => {
        selectedDate.value = new Date(newDate);
    };

    // Calcule les dates min et max à chaque mise à jour des ventes
    const updateMinMaxDates = () => {
        const dates = salesData.map(data => new Date(data.orderDate));
        minDate.value = new Date(Math.min(...dates));
        maxDate.value = new Date(Math.max(...dates));
    };

    const groupedSalesData = computed(() => {
    const grouped = {};
    updateMinMaxDates(); // Mettre à jour minDate et maxDate

    if (period.value === 'all') {
        for (let year = minDate.value.getFullYear(); year <= maxDate.value.getFullYear(); year++) {
            grouped[year] = 0;
        }

        salesData.forEach(data => {
            const date = new Date(data.orderDate);
            const year = date.getFullYear();
            grouped[year] += data.orderAmount;
        });

    } else if (period.value === 'year') {
        const currentYear = selectedDate.value.getFullYear();
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
        for (let month = 0; month < 12; month++) {
            grouped[monthNames[month]] = 0;
        }
    
        salesData.forEach(data => {
            const date = new Date(data.orderDate);
            if (date.getFullYear() === currentYear) {
                const monthKey = monthNames[date.getMonth()];
                grouped[monthKey] += data.orderAmount;
            }
        });
    } else if (period.value === 'month') {
        const currentYear = selectedDate.value.getFullYear();
        const currentMonth = selectedDate.value.getMonth();
    
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        for (let day = 1; day <= daysInMonth; day++) {
            grouped[`${day.toString().padStart(2, '0')}`] = 0; // Ajouter les jours au format "01", "02", ...
        }
        
        salesData.forEach(data => {
            const date = new Date(data.orderDate);
            if (
                date.getFullYear() === currentYear &&
                date.getMonth() === currentMonth
            ) {
                const dayKey = `${date.getDate().toString().padStart(2, '0')}`; // Clé au format "01", "02", ...
                grouped[dayKey] += data.orderAmount;
            }
        });
    }
    return grouped;
});

const groupedSalesByDay = computed(() => {
    const salesGrouped = {};

    salesData.forEach(data => {
        const dateKey = new Date(data.orderDate).toISOString().split('T')[0]; // Take the date without the time
        if (!salesGrouped[dateKey]) {
            salesGrouped[dateKey] = 0;
        }
        salesGrouped[dateKey] += data.orderAmount; // Add the sale for this day
    });

    return salesGrouped;
});

const groupedSalesByMonth = computed(() => {
    const salesGrouped = {};

    salesData.forEach(data => {
        const monthKey = new Date(data.orderDate).toISOString().split('T')[0].slice(0, 7); // Extract the month in 'YYYY-MM' format
        if (!salesGrouped[monthKey]) {
            salesGrouped[monthKey] = 0;
        }
        salesGrouped[monthKey] += data.orderAmount; // Add the sale for this month
    });

    return salesGrouped;
});

const groupedSalesByYear = computed(() => {
    const salesGrouped = {};

    salesData.forEach(data => {
        const yearKey = new Date(data.orderDate).getFullYear(); // Extract the year
        if (!salesGrouped[yearKey]) {
            salesGrouped[yearKey] = 0;
        }
        salesGrouped[yearKey] += data.orderAmount; // Add the sale for this year
    });

    return salesGrouped;
});

const maxSalesValue = computed(() => {
    let maxValue;
    
    if (period.value === "all") {
        const groupedSales = groupedSalesByYear.value;
        maxValue = Math.max(...Object.values(groupedSales)); // Max sales for the year
    } else if (period.value === "year") {
        const groupedSales = groupedSalesByMonth.value;
        maxValue = Math.max(...Object.values(groupedSales)); // Max sales for the month
    } else if (period.value === "month") {
        const groupedSales = groupedSalesByDay.value;
        maxValue = Math.max(...Object.values(groupedSales)); // Max sales for the day
    }

    return maxValue;
});



const chartData = computed(() => {
    const maxValue = maxSalesValue.value;

    if (period.value === 'all') {
        const labels = Object.keys(groupedSalesData.value); // Années
        const values = Object.values(groupedSalesData.value); // Montants correspondants
    
        return { labels, values, maxValue };
    } else if (period.value === 'year') {
        const labels = Object.keys(groupedSalesData.value); 
        const values = Object.values(groupedSalesData.value); 
    
        return { labels, values, maxValue };
    } else if (period.value === 'month') {
        const currentYear = selectedDate.value.getFullYear();
        const currentMonth = selectedDate.value.getMonth();
    
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const labels = Array.from(
            { length: daysInMonth },
            (_, i) => (i + 1).toString().padStart(2, '0')
        );
    
        const groupedData = groupedSalesData.value;
        const values = labels.map(day => groupedData[day] || 0); 
    
        return { labels, values, maxValue };
    }
});

    const updateDateStatus = () => {
        // Vérification que minDate et maxDate sont définis avant d'accéder à leurs méthodes
        if (minDate.value && maxDate.value) {
            const currentDate = new Date();
    
            if (period.value === 'year') {
                isAtMinDate.value = selectedDate.value.getFullYear() === minDate.value.getFullYear();
                isAtMaxDate.value = selectedDate.value.getFullYear() === maxDate.value.getFullYear();
            } else if (period.value === 'month') {
                isAtMinDate.value = (selectedDate.value.getFullYear() === minDate.value.getFullYear() && selectedDate.value.getMonth() === minDate.value.getMonth());
                isAtMaxDate.value = (selectedDate.value.getFullYear() === maxDate.value.getFullYear() && selectedDate.value.getMonth() === maxDate.value.getMonth());
            }
        }
    };

    // Fonction pour naviguer en arrière
    const navigateBack = () => {
        if (isCooldownActive.value) {
            clickDuringCooldown.value = true;
            return;
        }

        const currentDate = new Date();

        if (period.value === 'year') {
            if (selectedDate.value.getFullYear() > minDate.value.getFullYear()) {
                setSelectedDate(
                    new Date(selectedDate.value.setFullYear(selectedDate.value.getFullYear() - 1))
                );
                startCooldown();
            }
        } else if (period.value === 'month') {
            if (selectedDate.value.getFullYear() > minDate.value.getFullYear() || 
                (selectedDate.value.getFullYear() === minDate.value.getFullYear() && selectedDate.value.getMonth() > minDate.value.getMonth())) {
                setSelectedDate(
                    new Date(selectedDate.value.setMonth(selectedDate.value.getMonth() - 1))
                );
                startCooldown();
            }
        }

        updateDateStatus();  // Mettre à jour l'état de la date après modification
    };

    // Fonction pour naviguer en avant
    const navigateForward = () => {
        if (isCooldownActive.value) {
            clickDuringCooldown.value = true;
            return;
        }

        if (period.value === 'year') {
            if (selectedDate.value.getFullYear() < maxDate.value.getFullYear()) {
                setSelectedDate(
                    new Date(selectedDate.value.setFullYear(selectedDate.value.getFullYear() + 1))
                );
                startCooldown();
            }
        } else if (period.value === 'month') {
            if (selectedDate.value.getFullYear() < maxDate.value.getFullYear() ||
                (selectedDate.value.getFullYear() === maxDate.value.getFullYear() && selectedDate.value.getMonth() < maxDate.value.getMonth())) {
                setSelectedDate(
                    new Date(selectedDate.value.setMonth(selectedDate.value.getMonth() + 1))
                );
                startCooldown();
            }
        }

        updateDateStatus();  // Mettre à jour l'état de la date après modification
    };

    // Mise à jour de l'état initial de la date min/max
    onMounted(() => {
        updateDateStatus();
    });

    const getStatus = (confirmed, cancelled, financialStatus, orderDate) => {
        const currentDate = new Date();
        const orderDateObj = new Date(orderDate);
        
        if (cancelled) {
            return 'cancelled';
        } else if (confirmed && financialStatus === 'paid' && !cancelled && differenceInDays(currentDate, orderDateObj) >= 30){
            return 'confirmed';
        } else {
            return 'pending'; 
        }
    };


    const getSales = (code) => {
        $axios
            .get(`/shopify/sales/${code}`)
            .then((response) => {
                salesData.splice(0, salesData.length); 
    
                response.data.forEach((element) => {
                    const type = 'Vente' ;
                    const orderAmount = parseFloat(element.current_subtotal_price);
                    const orderDate = element.created_at;
                    const firstName = element.customer.first_name;
                    const lastName = element.customer.last_name;
                    const email = element.customer.email;
                    const isConfirmed = element.confirmed ;
                    const isCancelled = element.cancelled_at !== null;
                    const financialStatus = element.financial_status;
                    const status = getStatus(isConfirmed, isCancelled, financialStatus, orderDate);

                    salesData.push({
                        type,
                        orderAmount,
                        orderDate,
                        firstName,
                        lastName,
                        email,
                        status
                    });
                });
            })
            .catch((error) => {
                return error;
            });
        };
    
    const totalAmountConfirmed = computed(() => {
        return salesData.reduce((total, data) => {
            if (data.status === 'confirmed') {
                total += data.orderAmount;
            }
            return total;
        }, 0);
    });

    const getCurrentWithdraw = async (id) => {
        try {
            const response = await $axios.get(`/api/withdraw/get/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            withdraw.value = response.data[0].totalWithdraw;
        } catch (error) {
            console.error('Error getting wallet:', error.response?.data || error.message);
            throw error;
        }
    }

    const updateWallet = async () => {
        if (process.client) {
            myProfile.value = JSON.parse(localStorage.getItem('user'));
            if (myProfile.value && myProfile.value.id) {
                await getVendorByUserId(myProfile.value.id);
                if (vendorId.value) {
                    await getCurrentWithdraw(vendorId.value);
                }
            }
        }
    }

    onMounted(async () => {
        await updateWallet();
    });

    const totalOrderConfirmed = computed(() => {
        return salesData.filter(data => data.status === 'confirmed').length;
    })

    const totalOdrerPending = computed(() => {
        return salesData.filter(data => data.status === 'pending').length;
    });

    const wallet = computed(() => {
        return totalAmountConfirmed.value * 0.80 * 0.04 - withdraw.value;
    })

    return {
        totalAmountConfirmed,
        chartData,
        period,
        salesData,
        data,
        selectedDate,
        getSales,
        startCooldown,
        navigateBack,
        navigateForward,
        isCooldownActive,
        clickDuringCooldown,
        isAtMaxDate,
        isAtMinDate,
        maxSalesValue,
        wallet,
        totalOrderConfirmed, 
        totalOdrerPending,
        updateWallet
    };
}
