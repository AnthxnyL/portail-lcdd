import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import fs from 'fs';
import { format } from 'fast-csv';
import os from 'os';

const prisma = new PrismaClient();

export const getUsers = async (req, res) => {
    try {
        const user = await prisma.user.findMany();
        res.status(200).json({ user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur serveur lors de la récupération des users.' });
    }
};

export const getUserById = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ error: 'ID requis.' });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: parseInt(id, 10) },
        });

        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé.' });
        }

        res.status(200).json({ user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur serveur lors de la récupération de l\'utilisateur.' });
    }
};

export const deleteUser = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ error: 'ID requis.' });
    }

    try {
        const user = await prisma.user.delete({
            where: { id: parseInt(id, 10) },
        });

        res.status(200).json({ message: 'Utilisateur supprimé avec succès.', user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur serveur lors de la suppression de l\'utilisateur.' });
    }
}

export const updateUser = async (req, res) => {
    const { id } = req.params;
    const { email, phoneNumber, firstName, lastName, address } = req.body;

    if (!id) {
        return res.status(400).json({ error: 'ID requis.' });
    }

    try {
        const user = await prisma.user.update({
            where: { id: parseInt(id, 10) },
            data: {
                firstName,
                lastName,
                email,
                phoneNumber,
                address,
            },
        });

        res.status(200).json({ message: 'Utilisateur mis à jour avec succès.', user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur serveur lors de la mise à jour de l\'utilisateur.' });
    }
}

export const updateUserRole = async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    if (!id) {
        return res.status(400).json({ error: 'ID requis.' });
    }

    try {
        const user = await prisma.user.update({
            where: { id: parseInt(id, 10) },
            data: {
                role,
            },
        });

        res.status(200).json({ message: 'Rôle utilisateur mis à jour avec succès.', user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur serveur lors de la mise à jour du rôle utilisateur.' });
    }
}

export const updateCardSent = async (req, res) => {
    const { id } = req.params;
    const { cardSent } = req.body;

    if (!id) {
        return res.status(400).json({ error: 'ID requis.' });
    }

    try {
        const user = await prisma.user.update({
            where: { id: parseInt(id, 10) },
            data: {
                cardSent,
            },
        });

        res.status(200).json({ message: 'Rôle utilisateur mis à jour avec succès.', user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur serveur lors de la mise à jour du statut de l\'envoie de la carte.' });
    }
}

export const exportUsersToCSV = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            where: { cardSent: false, role: 'VENDEUR' },
            select: {
                firstName: true,
                lastName: true,
                email: true,
                address: true,
                vendor: { select: { promoCode: true, picture: { select: { url: true } } } }
            }
        });

        if (users.length === 0) {
            return res.status(404).json({ message: 'Aucun utilisateur à exporter.' });
        }

        res.setHeader('Content-Disposition', 'attachment; filename=users.csv');
        res.setHeader('Content-Type', 'text/csv');

        const csvStream = format({ headers: true });
        csvStream.pipe(res);

        users.forEach(user => {
            csvStream.write({
                Nom: `${user.firstName} ${user.lastName}`,
                Email: user.email,
                Adresse: user.address || 'Non renseignée',
                "Code promo": user.vendor?.promoCode || 'Pas de code',
                Url: `https://lecercledesdiamantaires.com/?discount=${user.vendor?.promoCode}`,
                Image: `https://partenaire.lecercledesdiamantaires.com/${user.vendor?.picture?.url}` || 'Pas d\'image'
            });
        });

        csvStream.end();
    } catch (error) {
        console.error('❌ Erreur lors de l\'export :', error);
        res.status(500).json({ error: 'Erreur serveur.' });
    }
};

