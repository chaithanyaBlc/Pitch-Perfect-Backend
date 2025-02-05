import { InferAttributes } from '@sequelize/core';
import { Router } from 'express';
// import * as jose from 'jose';
import { JWTPayload, jwtVerify, SignJWT } from 'jose'
import { SuperAdmin } from 'src/models';
import { Admin } from 'src/models';
import { User } from 'src/models';


type Payload = Pick<InferAttributes<SuperAdmin | Admin | User>, 'id'>;

const ENCODED_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);
// console.log(process.env.JWT_SECRET)

export function generateToken(user: SuperAdmin | Admin | User, role: string): Promise<string> {
    return new SignJWT(<Payload> {
        id: user.id,
        role: role 
    })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(ENCODED_SECRET);
}

export async function verifyToken(token: string) {
    const { payload } = await jwtVerify(token, ENCODED_SECRET, {
        algorithms: ['HS256'],
    });

    return payload as JWTPayload & Payload
}





































































