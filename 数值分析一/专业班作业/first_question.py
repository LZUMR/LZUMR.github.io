# Gauss-Legendre numerical integration
import cmath


def gauss_legendre_4(f):
    x = [-0.8611363116,-0.3399810436,0.3399810436,0.8611363116]
    A = [0.3478548451,0.6521451549,0.6521451549,0.3478548451]

    return sum(A[i] * f(x[i]) for i in range(4))


def transform(f, a, b):
    def g(t):
        return f((b + a) / 2 + (b - a) * t / 2) * (b - a) / 2
    return g


def div(f, a, b, n):
    h = (b - a) / n
    x = [a + i * h for i in range(n + 1)]
    
    return x, h, f


def integrate(f, a, b, pre_integral, episilon=1e-7):
    n =1
    while True:
        x, h, f = div(f, a, b, n)
        integral = sum(gauss_legendre_4(transform(f, x[i], x[i + 1])) for i in range(n))
        if abs(integral - pre_integral) < episilon:
            break
        n += 1
 
    

    print(f"一共分出的区间个数: {n}")
    print(f"节点:{x}")
    print(f"积分值: {integral}")
    return integral, n


def f0(x):
    return 1 / (cmath.sin(x) ** 2 + 1/4 * cmath.cos(x) ** 2)

a = 0
b = cmath.pi / 2


integral, n = integrate(f0, a, b, cmath.pi)