---
layout: post
title: "Thom Isomorphism Theorem"
---

This post is about proving the Thom isomorphism theorem and writing down some remarks about the orientation of vector bundles.

Let $\gamma : X \rightarrow B$ be a real vector bundle of rank $k$. A common definition of the orientation of $\gamma$ is the following.

**Definition**: Over a trivialising open set $U_i$, the homeomorphism $\phi_i : \gamma^{-1}(U_i) \overset{\simeq}{\rightarrow} U_i \times \mathbb{R}^k$ should be fibrewise orientation preserving. On each fibre $F_b$, this amounts to say that $\phi_i\|_{F_b} : F_b \rightarrow \mathbb{R}^k$ is an element of $SO(k)$.

Let $R$ be any ring (with a unit). All the cohomology will be taken with $R$ coefficients. The above map induces an isomorphism on cohomology

$$
(\phi|_F)^* : H^k(\mathbb{R}^k, \mathbb{R}^k - \{0\}) \overset{\simeq}{\longrightarrow} H^k(F, F-\{x\}).
$$

We fix once a for all a generator of $H^k(\mathbb{R}^k, \mathbb{R}^k - \{0\}) \simeq R$. Then, because $(\phi\|_F)^*$ really is the multiplication $\det(\phi_i\|_F)\cdot - : R \rightarrow R$, we recast our previous definition in cohomological language.

**New Definition**: An orientation of $\gamma$ is a choice of a generator $$\mu_b \in H^k(F_b, F_b-\{ x \})$$ for all the fibres $F_b$ such that there exists a class in $H^k(U, U-B)$ that restricts to these generators (under the map induced by $$(F_b, F_b-\{x\}) \hookrightarrow (U, U-B)$$ where $U$ is some open set and $B$ is a ball).
(When $R$ is an arbitrary ring, a generator is a element $u \in R$ such that $Ru = R$, ie. $u$ is a unit because we want our rings to have a multiplicative identity.)


We can now state the theorem.

**Theorem**: Given an oriented rank $k$ Euclidean vector bundle $\gamma : X\rightarrow B$ with unit disk and unit sphere bundles $D(\gamma) \rightarrow B$ and $S(\gamma) \rightarrow B$, there exists a class $u \in H^k(D(\gamma), S(\gamma))$ so that for each $b \in B$, the restriction to the fibre over $b$

$$
H^k(D(\gamma),S(\gamma)) \longrightarrow H^k(D(\gamma)_b, S(\gamma)_b) \simeq R
$$

takes $u$ to a generator. Furthermore, the morphism

$$
H^p(B) \longrightarrow H^{p+k}(D(\gamma),S(\gamma)) \qquad x \mapsto \gamma^*(x) \smile u
$$

is an isomorphism for all $p$.

**Remarks**: The class $u$ is natural with respect to pulling back vector bundles. It is called the Thom class and $D(\gamma)/S(\gamma) = \mathrm{Th}(\gamma)$ is the Thom space of the vector bundle. In particular, we have an isomorphism (because we have a good pair) $H^p(D(\gamma),S(\gamma)) \simeq \tilde{H^p}(\mathrm{Th}(\gamma))$.


**Proof**:

First, we consider the (relative) fibration $(D^k, S^{k-1}) \rightarrow (D(\gamma),S(\gamma)) \rightarrow B$ and its associated Serre spectral sequence (one of the relative versions):

$$
E_2^{p,q} \simeq H^p(B; \mathcal{H}^q(D^k, S^{k-1})) \Rightarrow H^*(D(\gamma),S(\gamma)).
$$

Using the assumption on the orientation of the vector bundle, we will see that the action $\pi_1(B) \curvearrowright H^k(D^k,S^{k-1})$ is trivial.

We recall how the action is defined. Let $\alpha$ be a path in $B$ between two point $b_1$ and $b_2$. We consider the map $F_{b_1} \times [0,1] \rightarrow B$ sending $(x,t) \mapsto \alpha(t)$ and lift it to a map $G : F_{b_1} \times [0,1] \rightarrow X$.

$$
\xymatrix{
        & X \ar[d]^\gamma \\
    F_{b_1} \times [0,1] \ar[r] \ar@{-->}[ur]^G & B 
}
$$

This lift yields a map $T : G(\cdot, 1) : F_{b_1} \rightarrow F_{b_2}$. This map is not uniquely defined, but its homotopy class is well defined. Hence, the morphism induced on cohomology is well defined.

Now, consider an element $\alpha \in \pi_1(B)$ (we identify $\alpha$ and its class in the fundamental group). By compactness, cover the loop $\alpha([0,1]) \subset B$ by finitely many open sets $U_1, \ldots, U_N$. By shrinking them and adding some more if needed, we can take these open sets to be trivialising open sets, ie. such that $\gamma^{-1}(U_i) \simeq U_i \times \mathbb{R}^k$. Order them along $\alpha$ (ie. take $U_0$ where the base point is, take $U_1$ covering part of the path after $U_0$, etc.).

Denote by $b_0$ the base point of $\alpha$. Choose $b_1 \in U_0 \cap U_1$, $b_2 \in U_1 \cap U_2$, ..., $b_{N+1} \in U_N \cap U_0$.


Because gluing all the lifts gives a lift, by uniqueness up to homotopy, we have an equality up to homotopy:

$$
    F_{b_0} \overset{T_0}{\longrightarrow} F_{b_1} \overset{T_1}{\longrightarrow} F_{b_2} \overset{T_2}{\longrightarrow} \cdots \overset{T_{N-1}}{\longrightarrow} F_{b_N} \overset{T_N}{\longrightarrow} F_{b_0} \simeq F_{b_0} \overset{T_\alpha}{\longrightarrow} F_{b_0}
$$

(where $T_\alpha$ is the map constructed from the whole path).

The construction above gives us well defined maps 

$$
T_i^* : H^k(F_{b_{i+1}}, F_{b_{i+1}} - \{*\}) \longrightarrow H^k(F_{b_{i}}, F_{b_{i}} - \{*\}).
$$

The orientation of our vector bundle gives us commutative diagrams

$$
\xymatrix@C=0em{
    H^k(F_{b_{i+1}}, F_{b_{i+1}} - \{*\}) \ar[rr]^{T_i^*} & & H^k(F_{b_{i}}, F_{b_{i}} - \{*\}) \\
    & H^k(U_i, U_i - B) \ar[ul]^{\mathrm{res}} \ar[ur]_{\mathrm{res}}
}
$$

(where $B_i \in U_i$ is some ball) that show that the map $T_i^*$ sends the class $\mu_{i+1}$ (representing the orientation at the fibre $F_{b_{i+1}}$) to the class $\mu_{i}$. (Indeed, they both are the restriction of a class in the cohomology of $(U_i, U_i -B)$.)

Hence, by composition, $T_\alpha^*$ is trivial. This is precisely saying that the action in trivial.


Now that we have thrown local coefficients out of the picture, the computations will follow smoothly.

Going back to our spectral sequence, we can write the second page as

$$
E_2^{p,q} = H^p(B; H^q(D^k,S^{k-1})) = \begin{cases}H^p(B) & \text{if } q=k\\0 & \text{otherwise}\end{cases}
$$

We see that all the differentials are zero. Hence $E_\infty^{p,q} = E_2^{p,q}$. Thus, $H^p(B) = H^{p+k}(D(\gamma),S(\gamma))$. Let $u$ be a generator (unit) of $E_\infty^{0,k} \simeq H^k(D(\gamma),S(\gamma)) \simeq H^0(B) (\simeq R)$. The edge homomorphism $H^k(D(\gamma),S(\gamma)) \rightarrow H^k(D^k, S^{k-1})$ is the map induced by the inclusion $(D^k,S^{k-1}) \hookrightarrow (D(\gamma),S(\gamma))$ (it is a general fact about the spectral sequence). More precisely, it is the composite. 

$$
H^k(D(\gamma),S(\gamma)) = E_\infty^{0,k} = E_2^{0,k} \simeq H^0(B; H^k(D^k,S^{k-1})) \simeq H^k(D^k,S^{k-1}).
$$

Hence, we see that $u$ restricts to a generator on each fibre. In particular, $u$ orients $\gamma : X\rightarrow B$. We remark here that it is natural by naturality of the spectral sequence.

Now, the goal is to prove that $H^p(B) \simeq H^{p+k}(D(\gamma),S(\gamma))$ is given by taking the cup product with $u$.

We look at the Serre spectral sequence of the fibration $D^k \rightarrow D(\gamma) \overset{\pi}{\rightarrow} B$. The second page is given by

$$
\overline{E}_2^{p,q} = H^p(B; \mathcal{H}^q(D^k)) \Rightarrow H^*(D(\gamma))
$$

and the spectral sequence collapses on the second page. (Indeed, the action is trivial and the only non zero elements of the second page are on the $q=0$ line.)

The edge homomorphism (on the bottom line) coincides with the morphism $\pi^* : H^p(B) \rightarrow H^p(D(\gamma))$. (And it is an isomorphism, which reflects the fact that the inclusion of the zero section is a homotopy equivalence).

It is a fact about the different Serre spectral sequences, that the cup product 

$$
    H^p(B; H^q(D^k)) \times H^r(B; H^s(D^k, S^{k-1})) \rightarrow H^{p+r}(B; H^{q+s}(D^k, S^{k-1}))
$$

induces a cup product on associated graded modules

$$
    \overline{E}_\infty^{p,q} \times E_\infty^{r,s} \rightarrow E_\infty^{p+r,q+s}.
$$

Hence, we construct the following commutative (by the above fact) diagram where all the vertical arrows are isomorphisms.

$$
\xymatrix{
    H^p(B) \times H^0(B) \ar[d] \ar[rr]^{\smile} & & H^p(B) \ar[d] \\
    H^p(B; H^0(D^k)) \times H^0(B; H^k(D^k, S^{k-1})) \ar[d] \ar[rr]^{\smile} && H^p(B; H^k{D^k, S^{k-1}}) \ar[d] \\
    \overline{E}_2^{p,0} \times E_2^{0,k} \ar[d] \ar[rr] && E_2^{p,k} \ar[d] \\
    \overline{E}_\infty^{p,0} \times E_\infty^{0,k} \ar[d] \ar[rr] && E_\infty^{p,k} \ar[d] \\
    H^p(D(\gamma)) \times H^k(D(\gamma), S(\gamma)) \ar[rr]^{\smile} &&H^{p+k}(D(\gamma),S(\gamma))
}
$$

The composite of the left vertical isomorphisms is sends $(x,1) \in H^p(B) \times H^0(B)$ to $(\gamma^*(x), u) \in H^p(D(\gamma)) \times H^k(D(\gamma), S(\gamma))$. Because $x \smile 1 = x$, currying with $1$ in the outer square yields the following commutative diagram.

$$
\xymatrix{
    H^p(B) \ar[d]^{\gamma^*}_\simeq \ar[rr]^{\smile 1}_\simeq && H^p(B) \ar[d]^{\simeq} \\
    H^p(D(\gamma)) \ar[rr]_{\smile u} && H^{p+k}(D(\gamma),S(\gamma))
}
$$

This proves our claim and ends the proof.