const Discord = require('discord.js');
const client = new Discord.Client();
const prefix = '!';

// زانیاری بەرهەمەکان
const products = [
    {
        id: 1,
        name: "ئەکاونتی نیترۆ",
        price: 9.99,
        description: "ئەکاونتی نیترۆ بۆ 1 ساڵ"
    },
    {
        id: 2,
        name: "سێرڤەری دیسکۆرد",
        price: 24.99,
        description: "سێرڤەری تایبەت بە بووت و ڕۆڵ"
    },
    {
        id: 3,
        name: "بووتی مۆدێرەیشن",
        price: 14.99,
        description: "بووتی مۆدێرەیشنی پێشکەوتوو"
    }
];

// سەبەتەی فرۆشتن بۆ هەر بەکارهێنەرێک
const userCarts = new Map();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setActivity('!help بۆ یارمەتی');
});

client.on('message', message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // فەرمانی یارمەتی
    if (command === 'help') {
        const helpEmbed = new Discord.MessageEmbed()
            .setColor('#5865F2')
            .setTitle('فەرمانەکانی بۆت')
            .setDescription('فەرمانەکانی بۆتی فرۆشتنی دیسکۆرد')
            .addField('`!products`', 'پیشاندانی هەموو بەرهەمەکان', false)
            .addField('`!add [ID]`', 'زیادکردنی بەرهەم بۆ سەبەتە', false)
            .addField('`!cart`', 'پیشاندانی سەبەتە', false)
            .addField('`!remove [ID]`', 'سڕینەوەی بەرهەم لە سەبەتە', false)
            .addField('`!checkout`', 'تەواوکردنی فرۆشتن', false)
            .setFooter('بۆتی فرۆشتنی دیسکۆرد');
        
        message.channel.send(helpEmbed);
    }

    // پیشاندانی بەرهەمەکان
    if (command === 'products') {
        const productsEmbed = new Discord.MessageEmbed()
            .setColor('#57F287')
            .setTitle('بەرهەمەکانی ئێمە')
            .setDescription('هەموو بەرهەمە بەردەستەکان');
        
        products.forEach(product => {
            productsEmbed.addField(
                `${product.name} - $${product.price}`,
                `${product.description}\nID: ${product.id}`,
                false
            );
        });
        
        message.channel.send(productsEmbed);
    }

    // زیادکردنی بەرهەم بۆ سەبەتە
    if (command === 'add') {
        const productId = parseInt(args[0]);
        const product = products.find(p => p.id === productId);
        
        if (!product) {
            return message.reply('بەرهەمەکە نەدۆزرایەوە! IDـەکە بڵێرە `!products` بۆ بینینی بەرهەمەکان.');
        }
        
        if (!userCarts.has(message.author.id)) {
            userCarts.set(message.author.id, []);
        }
        
        const userCart = userCarts.get(message.author.id);
        const existingItem = userCart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            userCart.push({
                ...product,
                quantity: 1
            });
        }
        
        message.reply(`**${product.name}** زیادکرا بۆ سەبەتەت!`);
    }

    // پیشاندانی سەبەتە
    if (command === 'cart') {
        if (!userCarts.has(message.author.id) || userCarts.get(message.author.id).length === 0) {
            return message.reply('سەبەتەکەت بەتاڵە!');
        }
        
        const userCart = userCarts.get(message.author.id);
        const cartEmbed = new Discord.MessageEmbed()
            .setColor('#FEE75C')
            .setTitle('سەبەتەی فرۆشتن')
            .setDescription(`سەبەتەی ${message.author.username}`);
        
        let total = 0;
        
        userCart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            
            cartEmbed.addField(
                `${item.name} x${item.quantity}`,
                `$${item.price} x ${item.quantity} = $${itemTotal.toFixed(2)}`,
                false
            );
        });
        
        cartEmbed.addField('کۆی گشتی', `$${total.toFixed(2)}`, false);
        
        message.channel.send(cartEmbed);
    }

    // سڕینەوەی بەرهەم لە سەبەتە
    if (command === 'remove') {
        const productId = parseInt(args[0]);
        
        if (!userCarts.has(message.author.id)) {
            return message.reply('سەبەتەکەت بەتاڵە!');
        }
        
        const userCart = userCarts.get(message.author.id);
        const itemIndex = userCart.findIndex(item => item.id === productId);
        
        if (itemIndex === -1) {
            return message.reply('ئەم بەرهەمە لە سەبەتەکەتدا نییە!');
        }
        
        const removedItem = userCart.splice(itemIndex, 1)[0];
        message.reply(`**${removedItem.name}** سڕایەوە لە سەبەتە!`);
        
        if (userCart.length === 0) {
            userCarts.delete(message.author.id);
        }
    }

    // تەواوکردنی فرۆشتن
    if (command === 'checkout') {
        if (!userCarts.has(message.author.id) || userCarts.get(message.author.id).length === 0) {
            return message.reply('سەبەتەکەت بەتاڵە!');
        }
        
        const userCart = userCarts.get(message.author.id);
        let total = 0;
        let itemsList = '';
        
        userCart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            itemsList += `- ${item.name} x${item.quantity} ($${itemTotal.toFixed(2)})\n`;
        });
        
        const checkoutEmbed = new Discord.MessageEmbed()
            .setColor('#ED4245')
            .setTitle('فرۆشتنی تەواو بوو!')
            .setDescription(`سوپاس بۆ کڕین لە ئێمە ${message.author.username}!`)
            .addField('بەرهەمەکان', itemsList)
            .addField('کۆی گشتی', `$${total.toFixed(2)}`, false)
            .addField('پەیوەندیکردن', 'بۆ تەواوکردنی فرۆشتن، لەگەڵ @Admin پەیوەندی بکە', false)
            .setFooter('بۆتی فرۆشتنی دیسکۆرد');
        
        message.channel.send(checkoutEmbed);
        
        // پاککردنەوەی سەبەتە دوای تەواوکردنی فرۆشتن
        userCarts.delete(message.author.id);
    }
});

// دەستپێکردنی بۆت
client.login('TOKENـەکەی خۆت لێرە بنوسە');