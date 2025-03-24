"use server"

import { presetSchema } from "@/app/(authenticated)/dashboard/presets/types";
import { getSession } from "@/lib/auth-client";
import db from "@/lib/db";
import { Doctor, doctor, OperationData, Preset, preset, User, user } from "@/lib/db/schema";
import { generateId } from "@/lib/funcs";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

export async function getUser() {
    const { data } = await getSession({
        fetchOptions: {
            headers: await headers()
        }
    })

    if(!data) return;

    const user = data.user

    if(user.role == 'admin') {
        return {
            id: user.id as User['id'],
            doctorId: null,
            role: user.role as User['role']
        }
    }

    const [doctorData] = await db.select().from(doctor)
        .where(eq(doctor.userId, user.id))

    return {
        id: user.id as User['id'],
        doctorId: doctorData.id as Doctor['id'],
        role: 'doctor' as User['id']
    }
}

export async function getDoctors() {
    const data = await db.query.doctor.findMany({
        columns: {
            id: true
        },
        with: {
            user: {
                columns: {
                    name: true
                }
            }
        }
    })

    return data.map((d) => {
        return {
            value: d.id,
            label: d.user.name.charAt(0).toUpperCase() + d.user.name.slice(1)
        }
    });
}

// to display them in the table
export async function getPresets() {
    const { data } = await getSession({
            fetchOptions: {
            headers: await headers()
        }
    })

    if(!data?.user) throw new Error("Unauthenticated")

    if(data?.user.role == 'admin') {
        const presets = await db.query.preset.findMany({
            with: {
                doctor: {
                    columns: {
                        id: true,
                    },
                    with: {
                        user: {
                            columns: {
                                name: true
                            }
                        }
                    }
                }
            }
        })

        return presets.map((preset) => {
            return {
                ...preset,
                doctorName: preset.doctor.user.name
            }
        })
    }

    const [doctorData] = await db.select({
        id: doctor.id
    }).from(doctor).where(eq(doctor.userId, data?.user.id))


    return await db.select().from(preset)
        .where(eq(preset.doctorId, doctorData.id))
}

// to get preset data for the update functionality
export async function getPreset({ presetId }: { presetId: Preset['id'] }) {
    return await db.query.preset.findFirst({
        where: eq(preset.id, presetId)
    })
}

export async function CreatePreset({ data, doctorId, documentName }: { 
    data: z.infer<typeof presetSchema>,
    doctorId: Doctor['id'],
    documentName: OperationData['documentName']
}) {

    const presetId = generateId()

    const [createdPreset] = await db.insert(preset).values({
        id: presetId,
        title: data.title,
        data: data.data,
        doctorId,
        documentName,
        createdAt: new Date(),
        updatedAt: new Date()
    }).returning({ id: preset.id })

    if(createdPreset.id) {
        revalidatePath('/dashboard/presets')
        return {
            message: "Preset Created Successfully!",
            error: null
        }
    }else {
        return {
            message: null,
            error: "Failed to create preset."
        }
    }
}

export async function UpdatePreset({ data, presetId }: { 
    data: z.infer<typeof presetSchema>,
    presetId: Preset['id']
}) {
    const [updatedPreset] = await db.update(preset).set({
        title: data.title,
        data: data.data,
        updatedAt: new Date()
    }).where(eq(preset.id, presetId)).returning({ id: preset.id })

    if(updatedPreset.id) {
        revalidatePath('/dashboard/presets')
        return {
            message: "Preset Updated Successfully!",
            error: null
        }
    }else {
        return {
            message: null,
            error: "Failed to update preset."
        }
    }
}