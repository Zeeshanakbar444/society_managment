import { Prisma } from '@prisma/client';

/**
 * Handles Prisma errors and returns a user-friendly error message and status code.
 * @param {Error} error - The error object caught in the route.
 * @param {Object} res - The Express response object.
 * @param {string} entityName - The name of the entity (e.g., "Resident", "House").
 */
export const handlePrismaError = (error, res, entityName = "Item") => {
    console.error(`[Prisma Error] ${entityName}:`, error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Unique constraint failed
        if (error.code === 'P2002') {
            const target = error.meta?.target || [];
            let message = `${entityName} already exists.`;

            if (target.includes('email')) {
                message = "A user with this email address already exists.";
            } else if (target.includes('houseNumber')) {
                message = "This house number is already assigned. Please use a unique number.";
            } else if (target.includes('name')) {
                message = `A ${entityName.toLowerCase()} with this name already exists.`;
            } else if (target.includes('phoneNumber')) {
                message = "This phone number is already registered.";
            }

            return res.status(400).json({ error: message });
        }

        // Foreign key constraint failed (e.g., deleting a parent record with children)
        if (error.code === 'P2003') {
            return res.status(400).json({
                error: `Cannot delete this ${entityName.toLowerCase()} because it is currently linked to other records.`
            });
        }

        // Record to delete/update not found
        if (error.code === 'P2025') {
            return res.status(404).json({ error: `${entityName} not found.` });
        }
    }

    // Default error response
    const statusCode = error.name === 'PrismaClientValidationError' ? 400 : 500;
    const message = statusCode === 400
        ? "Invalid data provided. Please check all fields."
        : "An unexpected error occurred. Please try again later.";

    return res.status(statusCode).json({ error: message });
};
