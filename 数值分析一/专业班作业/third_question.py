# FFT
import cmath
import numpy as np



m = 3
a = [9, 7, 5, 3, 1, 4, 6, 8]
N = 2**m


a_0 = [a[i] for i in range(0, len(a))]
S = N



def tran(a):
    n = len(a)
    num_bits = n.bit_length() - 1
    result = [0] * n
    for i in range(n):
        binary_str = bin(i)[2:].zfill(num_bits)
        rev_i = int(binary_str[::-1], 2)
        result[rev_i] = a[i]
    return result



def FFT(a,m):
    N = 2**m
    a_0 = a.copy()
    S = N

    while S > 1:
        T = N//S
        for k in range(1, T+1):
            for l in range((k-1)*S, (k-1)*S+S//2 ):
                y = a_0[l]
                a_0[l] = y + a_0[l+S//2]
                a_0[l+S//2] = (y - a_0[l+S//2])*cmath.exp(-2j*cmath.pi*l/S)
        S = S//2

    return tran(a_0)


result = FFT(a, m)

print(result)