import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const addEmailToWhitelist = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'L\'email est requis.' });
    }

    try {
        // Vérifier si l'email est déjà dans la whitelist
        const existingEntry = await prisma.whitelist.findUnique({
            where: { email },
        });

        if (existingEntry) {
            return res.status(400).json({ error: 'Cet email est déjà dans la whitelist.' });
        }

        // Ajouter l'email à la whitelist
        const whitelistEntry = await prisma.whitelist.create({
            data: { email },
        });

        res.status(201).json({
            message: 'Email ajouté à la whitelist avec succès.',
            whitelistEntry,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur serveur.' });
    }
};