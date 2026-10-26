import { useEffect, useState } from 'react'
import axios from 'axios'
import { useParams } from 'react-router-dom'
import '../../Style/profile.css'

const getFoodItems = (data) => [
    data,
    data?.foods,
    data?.foodItems,
    data?.fooditems,
    data?.fooditem,
    data?.food,
    data?.reels,
    data?.data,
    data?.data?.foods,
    data?.data?.foodItems,
    data?.data?.fooditems,
    data?.data?.fooditem,
    data?.data?.food,
    data?.data?.reels,
].find(Array.isArray)

const getPartnerId = (food) => {
    const partner = food.foodPartner ?? food.foodPartnerId ?? food.partner ?? food.owner
    const partnerId = typeof partner === 'object' && partner !== null
        ? partner._id ?? partner.id
        : partner

    return partnerId == null ? null : String(partnerId)
}

const getPartnerRecord = (data) => {
    const partner = data?.foodPartner
        ?? data?.foodpartner
        ?? data?.data?.foodPartner
        ?? data?.data?.foodpartner
        ?? data?.partner
        ?? data?.data?.partner
        ?? data?.profile
        ?? data?.data?.profile
        ?? data?.foodPartnerData
        ?? data?.data?.foodPartnerData
        ?? data

    if (!partner || typeof partner !== 'object' || Array.isArray(partner)) return null

    return partner
}

const getNestedRecords = (record, depth = 0) => {
    if (!record || typeof record !== 'object' || Array.isArray(record) || depth > 3) return []

    const nestedRecords = [
        record.foodPartner,
        record.foodpartner,
        record.partner,
        record.profile,
        record.user,
        record.business,
        record.restaurant,
        record.owner,
        record.contact,
        record.data,
    ]

    return [
        record,
        ...nestedRecords.flatMap((nested) => getNestedRecords(nested, depth + 1)),
    ]
}

const formatAddress = (value) => {
    if (typeof value === 'string') return value.trim()
    if (!value || typeof value !== 'object') return ''

    const formatted = value.formattedAddress ?? value.fullAddress ?? value.address
    if (typeof formatted === 'string' && formatted.trim()) return formatted.trim()

    return [
        value.street,
        value.addressLine1,
        value.addressLine2,
        value.city,
        value.state,
        value.postalCode,
        value.zipCode,
        value.country,
        value.name,
    ].filter((part) => typeof part === 'string' && part.trim()).join(', ')
}

const formatImage = (value) => {
    if (typeof value === 'string') return value.trim()
    if (!value || typeof value !== 'object') return ''

    return value.url ?? value.secure_url ?? value.src ?? value.path ?? ''
}

const getImageUrl = (image) => {
    if (/^(https?:|data:|blob:|\/\/)/i.test(image)) return image

    return `http://localhost:5000/${image.replace(/^\/+/, '')}`
}

const getPartnerDetails = (partner, food = {}) => {
    const partnerRecords = getNestedRecords(partner)
    const records = [...partnerRecords, ...getNestedRecords(food)]
    const getValue = (sourceRecords, keys) => keys
        .flatMap((key) => sourceRecords.map((record) => record[key]))
        .find((value) => typeof value === 'string' && value.trim())
    const address = records
        .flatMap((record) => [
            record.address,
            record.adress,
            record.businessAddress,
            record.businessAdress,
            record.foodPartnerAddress,
            record.restaurantAddress,
            record.fullAddress,
            record.formattedAddress,
            record.location,
        ])
        .map(formatAddress)
        .find(Boolean)
    const image = records
        .flatMap((record) => [
            record.profileImage,
            record.profilePic,
            record.profilePicture,
            record.avatar,
            record.imageUrl,
            record.photo,
            record.logo,
            record.image,
        ])
        .map(formatImage)
        .find(Boolean)
    const name = getValue(partnerRecords, [
        'businessName',
        'bussinessName',
        'businessname',
        'business_name',
        'restaurantName',
        'foodPartnerName',
        'partnerName',
        'contactName',
        'ownerName',
        'name',
    ]) ?? getValue(getNestedRecords(food), [
        'businessName',
        'bussinessName',
        'restaurantName',
        'foodPartnerName',
        'partnerName',
    ])

    return {
        ...partner,
        name: name ?? 'Food partner',
        address: address ?? '',
        image: image ?? '',
    }
}

const Profile = () => {
    const { id } = useParams()
    const [profile, setProfile] = useState(null)
    const [foods, setFoods] = useState([])
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(true)
    const [failedVideoIds, setFailedVideoIds] = useState(() => new Set())

    useEffect(() => {
        const controller = new AbortController()

        const loadProfile = async () => {
            try {
                const { data } = await axios.get(
                    id
                        ? `http://localhost:5000/api/food-partner/${id}`
                        : 'http://localhost:5000/api/food-partner/profile',
                    {
                        withCredentials: true,
                        signal: controller.signal,
                    }
                )

                const foodPartner = getPartnerRecord(data)
                if (!foodPartner) {
                    setError('Food partner details were not returned by the API.')
                    return
                }

                const foods = getFoodItems(foodPartner) ?? getFoodItems(data) ?? []
                setProfile(getPartnerDetails(foodPartner, foods[0] ?? {}))
                setFoods(foods)
            } catch (requestError) {
                if (controller.signal.aborted) return

                if (id && axios.isAxiosError(requestError) && requestError.response?.status === 404) {
                    try {
                        const { data } = await axios.get('http://localhost:5000/api/food/', {
                            withCredentials: true,
                            signal: controller.signal,
                            timeout: 10000,
                        })
                        const allFoods = getFoodItems(data) ?? []
                        const partnerFoods = allFoods.filter((food) => getPartnerId(food) === id)

                        if (partnerFoods.length === 0) {
                            setError('Store not found. The food API has no items linked to this store ID.')
                            return
                        }

                        const relatedPartner = partnerFoods
                                    .map((food) => food.foodPartner ?? food.foodpartner ?? food.partner ?? food.owner)
                            .find((partner) => typeof partner === 'object' && partner !== null)

                        setProfile(getPartnerDetails(relatedPartner ?? {}, partnerFoods[0]))
                        setFoods(partnerFoods)
                    } catch (fallbackError) {
                        if (!controller.signal.aborted) {
                            setError(
                                (axios.isAxiosError(fallbackError) && fallbackError.response?.data?.message)
                                || (fallbackError instanceof Error ? fallbackError.message : 'Could not load store.')
                            )
                        }
                    }
                } else {
                    setError(
                        (axios.isAxiosError(requestError) && requestError.response?.data?.message)
                        || (requestError instanceof Error ? requestError.message : 'Could not load profile.')
                    )
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false)
                }
            }
        }

        loadProfile()

        return () => controller.abort()
    }, [id])

    return (
        <main className="profile-page">
            {loading ? (
                <p className="profile-message">Loading profile...</p>
            ) : error ? (
                <p className="profile-error" role="alert">Failed to load profile: {error}</p>
            ) : (
                <>
                    <section className="profile-header">
                        <div className="profile-meta">
                            {profile.image ? (
                                <img
                                    className="profile-avatar"
                                    src={getImageUrl(profile.image)}
                                    alt={`${profile.name} profile`}
                                    onError={(event) => {
                                        event.currentTarget.hidden = true
                                    }}
                                />
                            ) : (
                                <div className="profile-avatar" aria-hidden="true" />
                            )}
                            <div className="profile-info">
                                <h1 className="profile-pill profile-business" title="Business name">
                                    {profile.name}
                                </h1>
                                <p className="profile-pill profile-address" title="Address">
                                    {profile.address || 'Address not provided'}
                                </p>
                            </div>
                        </div>

                        <div className="profile-stats" role="list" aria-label="Stats">
                            <div className="profile-stat" role="listitem">
                                <span className="profile-stat-label">total meals</span>
                                <span className="profile-stat-value">{foods.length}</span>
                            </div>
                            <div className="profile-stat" role="listitem">
                                <span className="profile-stat-label">customer served</span>
                                <span className="profile-stat-value">{profile.customersServed ?? 0}</span>
                            </div>
                        </div>
                    </section>

                    <hr className="profile-sep" />

                    <section className="profile-grid" aria-label="Videos">
                        {foods.length > 0 ? foods.map((food, index) => (
                            <article className="profile-grid-item" key={food._id ?? index}>
                                {food.video && !failedVideoIds.has(food._id ?? index) ? (
                                    <video
                                        className="profile-grid-video"
                                        src={food.video}
                                        autoPlay
                                        loop
                                        controls
                                        muted
                                        playsInline
                                        preload="auto"
                                        aria-label={food.name ? `${food.name} video` : 'Food video'}
                                        onError={() => {
                                            setFailedVideoIds((current) => new Set(current).add(food._id ?? index))
                                        }}
                                    />
                                ) : food.video ? (
                                    <a
                                        className="profile-video-fallback"
                                        href={food.video}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        {food.name || 'Open video'}
                                    </a>
                                ) : (
                                    <span>Video unavailable</span>
                                )}
                            </article>
                        )) : (
                            <p className="profile-message">No videos found for this food partner.</p>
                        )}
                    </section>
                </>
            )}
        </main>
    )
}

export default Profile
